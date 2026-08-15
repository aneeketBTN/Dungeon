/* Verification-only OpenAI-compatible endpoint for the local grader plumbing.
 * It is intentionally deterministic and does not evaluate academic quality. */
import http from "node:http";

const port = Number(process.argv[2] || 12345);
const model = "fake-qwen-verification";

function send(response, code, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(code, {"Content-Type": "application/json", "Content-Length": Buffer.byteLength(body)});
  response.end(body);
}

http.createServer((request, response) => {
  if (request.method === "GET" && request.url === "/v1/models") {
    return send(response, 200, {object: "list", data: [{id: model, object: "model"}]});
  }
  if (request.method !== "POST" || request.url !== "/v1/chat/completions") return send(response, 404, {error: "not found"});
  let raw = "";
  request.on("data", (chunk) => { raw += chunk; });
  request.on("end", () => {
    const body = JSON.parse(raw || "{}");
    const task = JSON.parse(body.messages?.[1]?.content || "{}");
    const answer = String(task.candidateAnswer || "");
    const answerEvidence = answer.split(/[.!?]/)[0].trim().slice(0, 120);
    const citation = task.retrievedCourseEvidence?.[0]?.citation || "missing#00";
    const forcePartial = answer.includes("FIXTURE_PARTIAL");
    const forceAbstain = answer.includes("FIXTURE_ABSTAIN");
    const output = {
      criteria: (task.question?.rubric || []).map((criterion, index) => {
        const decision = forcePartial && criterion.id === "reason"
          ? "not_met"
          : forceAbstain && index === 0 && task.role === "verifier"
            ? "not_met"
            : "met";
        return {
          id: criterion.id,
          decision,
          gapCodes: decision === "not_met"
            ? [(task.question.gapTaxonomy || []).find((gap) => gap.criterionId === criterion.id)?.id].filter(Boolean)
            : [],
          answerEvidence: decision === "met" ? answerEvidence : "",
          sourceCitations: [citation],
          reason: decision === "met" ? "Deterministic verification fixture accepted this criterion." : "Deterministic verification fixture left this criterion open."
        };
      }),
      feedback: "Deterministic verification fixture: local grading plumbing completed."
    };
    const complete = () => send(response, 200, {id: "fixture", choices: [{message: {role: "assistant", content: JSON.stringify(output)}}]});
    if (answer.includes("FIXTURE_DELAY")) setTimeout(complete, 1500); else complete();
  });
}).listen(port, "127.0.0.1", () => {
  process.stdout.write(`fake LM Studio listening on ${port}\n`);
});
