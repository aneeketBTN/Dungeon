import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { inspectReadiness, validateEvent } from "../tools/validate-agent-readiness.mjs";

const root = resolve(import.meta.dirname, "..");

test("agent scaffold is healthy, paused, and blocked from activation", async () => {
  const result = await inspectReadiness();
  assert.equal(result.ok, true);
  assert.equal(result.deployable, false);
  assert.equal(result.status, "WAITING_BACKEND");
  assert.ok(result.blockers.includes("ownerActivation"));
  assert.ok(result.agents.every(agent => agent.paused && agent.failClosed && agent.authorityBounded));
});

test("telemetry contract rejects undeclared personal or raw-response fields", async () => {
  const schema = JSON.parse(await readFile(resolve(root, ".agents/contracts/tester-event.schema.json"), "utf8"));
  const valid = JSON.parse((await readFile(resolve(root, ".agents/fixtures/synthetic-events.jsonl"), "utf8")).trim().split(/\r?\n/)[0]);
  assert.deepEqual(validateEvent(valid, schema), []);
  const invalid = { ...valid, email: "student@example.com", raw_text: "private answer" };
  assert.deepEqual(validateEvent(invalid, schema).sort(), ["unknown:email", "unknown:raw_text"]);
});

test("every external action remains proposed and owner-approved", async () => {
  const schema = JSON.parse(await readFile(resolve(root, ".agents/contracts/agent-output.schema.json"), "utf8"));
  const action = schema.properties.external_actions.items.properties;
  assert.equal(action.status.const, "proposed-not-executed");
  assert.equal(action.owner_approval_required.const, true);
});

