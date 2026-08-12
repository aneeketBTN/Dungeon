import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function readJson(path) {
  return JSON.parse(await readFile(resolve(root, path), "utf8"));
}

export function validateEvent(event, schema) {
  const errors = [];
  const allowed = new Set(Object.keys(schema.properties || {}));
  const required = schema.required || [];
  for (const key of required) if (!(key in event)) errors.push(`missing:${key}`);
  for (const key of Object.keys(event)) if (!allowed.has(key)) errors.push(`unknown:${key}`);
  /* Read the allowed values out of the contract rather than restating them here. The
     two were duplicated and drifted apart the moment the contract gained a second
     consent scope, which is exactly the failure a validator should not have. */
  if (event.schema_version !== schema.properties.schema_version.const) errors.push("schema_version");
  if (!/^evt_[A-Za-z0-9_-]{8,80}$/.test(event.event_id || "")) errors.push("event_id");
  if (!/^tester_[A-Za-z0-9_-]{6,64}$/.test(event.tester_id || "")) errors.push("tester_id");
  if (!/^session_[A-Za-z0-9_-]{6,64}$/.test(event.session_id || "")) errors.push("session_id");
  if (!(schema.properties.consent_scope.enum || []).includes(event.consent_scope)) errors.push("consent_scope");
  if (typeof event.synthetic !== "boolean") errors.push("synthetic");
  if (!(schema.properties.event_type.enum || []).includes(event.event_type)) errors.push("event_type");

  /* The cross-field rule, and the one that is not a restatement of the schema: an
     examiner event may only ride the examiner consent scope and vice versa. A tester
     who consented to learning telemetry has not consented to having their exam
     performance collected, and the way that goes wrong in practice is a new event
     type shipped under the old scope because it was the one already granted. */
  const examinerRule = (schema.allOf || []).find(rule => rule.if?.properties?.event_type?.enum);
  if (examinerRule) {
    const examinerTypes = examinerRule.if.properties.event_type.enum;
    const expected = examinerTypes.includes(event.event_type)
      ? examinerRule.then.properties.consent_scope.const
      : examinerRule.else.properties.consent_scope.const;
    if (event.consent_scope !== expected) errors.push("consent_scope:wrong-scope-for-event");
  }
  return errors;
}

export async function inspectReadiness() {
  const deployment = await readJson(".agents/deployment.json");
  const eventSchema = await readJson(".agents/contracts/tester-event.schema.json");
  await readJson(".agents/contracts/agent-output.schema.json");
  const lines = (await readFile(resolve(root, ".agents/fixtures/synthetic-events.jsonl"), "utf8"))
    .trim().split(/\r?\n/).filter(Boolean);
  const fixtureErrors = lines.flatMap((line, index) =>
    validateEvent(JSON.parse(line), eventSchema).map(error => `line-${index + 1}:${error}`));
  const charterChecks = await Promise.all(deployment.agents.map(async agent => {
    const charter = await readFile(resolve(root, agent.charter), "utf8");
    return {
      id: agent.id,
      exists: charter.length > 200,
      failClosed: /WAITING_|activation-check/.test(charter),
      authorityBounded: /Never|never/.test(charter),
      paused: agent.enabled === false && ["not-created", "paused"].includes(agent.automationStatus)
    };
  }));
  const forbiddenTelemetryFields = ["name", "email", "phone", "whatsapp", "ip_address", "user_agent", "raw_text", "written_response"];
  const schemaFields = Object.keys(eventSchema.properties || {});
  const forbiddenPresent = forbiddenTelemetryFields.filter(field => schemaFields.includes(field));
  const gates = deployment.activationGates || {};
  const blockers = Object.entries(gates).filter(([, value]) => value !== true).map(([key]) => key);
  const healthy = deployment.status === "prepared-not-activated" && fixtureErrors.length === 0 &&
    forbiddenPresent.length === 0 && charterChecks.every(check => check.exists && check.failClosed && check.authorityBounded && check.paused);
  return {
    ok: healthy,
    status: blockers.length ? "WAITING_BACKEND" : "READY_FOR_OWNER_ACTIVATION",
    deployable: healthy && blockers.length === 0,
    agents: charterChecks,
    syntheticFixtureEvents: lines.length,
    fixtureErrors,
    forbiddenTelemetryFieldsPresent: forbiddenPresent,
    blockers
  };
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const result = await inspectReadiness();
  console.log(JSON.stringify(result, null, 2));
  const activationCheck = process.argv.includes("--activation");
  if (!result.ok || (activationCheck && !result.deployable)) process.exitCode = 1;
}

