#!/usr/bin/env node

/* Builds a Vectorize NDJSON file from the owner's external clean transcripts.
 * The transcript root and generated vectors remain ignored local material. This
 * script does not insert or deploy anything; Wrangler performs that separate,
 * explicit owner action after metadata indexes exist. */
import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

import {chunkLecture} from "./local-grader.mjs";

const require = createRequire(import.meta.url);
const {loadLectures} = require("./lib/clean_transcripts.js");
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const MODEL = "@cf/qwen/qwen3-embedding-0.6b";
const COURSE_IDS = new Set(["BRGSA", "IBM", "SCLM", "SPMS"]);

export function courseRagChunks(lectures, corpusVersion) {
  if (!/^[a-z0-9][a-z0-9._-]{4,63}$/i.test(corpusVersion)) throw new Error("Corpus version must be a stable 5–64 character identifier.");
  return lectures.flatMap((lecture) => {
    const courseId = String(lecture.subject || "").toUpperCase();
    const lectureId = String(lecture.lecture_id || "");
    if (!COURSE_IDS.has(courseId) || !/^[A-Z0-9_-]{4,80}$/.test(lectureId)) {
      throw new Error("Every transcript must have a valid Term 6 subject and lecture ID.");
    }
    return chunkLecture(lecture).map((chunk) => {
      if (!chunk.text || chunk.text.length > 8000) throw new Error(`Transcript chunk exceeds the Vectorize metadata boundary: ${chunk.citation}`);
      const id = createHash("sha256").update(`${corpusVersion}\0${chunk.citation}`).digest("hex").slice(0, 40);
      return {
        id,
        text: chunk.text,
        metadata: {
          courseId,
          lectureId,
          corpusVersion,
          citation: chunk.citation,
          title: String(chunk.title || lectureId).slice(0, 240),
          text: chunk.text
        }
      };
    });
  });
}

async function embed(accountId, token, texts) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${MODEL}`, {
    method: "POST",
    headers: {Authorization: `Bearer ${token}`, "Content-Type": "application/json"},
    body: JSON.stringify({text: texts})
  });
  if (!response.ok) throw new Error(`Workers AI embedding request failed with HTTP ${response.status}.`);
  const payload = await response.json();
  const vectors = payload?.result?.data;
  if (!payload?.success || !Array.isArray(vectors) || vectors.length !== texts.length ||
      vectors.some((vector) => !Array.isArray(vector) || vector.length !== 1024 || vector.some((value) => !Number.isFinite(value)))) {
    throw new Error("Workers AI returned incomplete 1024-dimensional embeddings.");
  }
  return vectors;
}

async function main() {
  const transcriptRoot = process.argv[2];
  const corpusVersion = process.argv[3];
  if (!transcriptRoot || !corpusVersion) {
    throw new Error("Usage: node tools/build_course_rag.mjs <external-transcript-root> <corpus-version> [output.ndjson]");
  }
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token) throw new Error("Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in the terminal environment.");
  const loaded = loadLectures(path.resolve(transcriptRoot));
  const chunks = courseRagChunks(loaded.lectures || [], corpusVersion);
  if (!chunks.length) throw new Error("No transcript chunks were prepared.");
  const output = path.resolve(process.argv[4] || path.join(ROOT, "work", `course-rag.${corpusVersion}.ndjson`));
  fs.mkdirSync(path.dirname(output), {recursive: true});
  const lines = [];
  const batchSize = 16;
  for (let index = 0; index < chunks.length; index += batchSize) {
    const batch = chunks.slice(index, index + batchSize);
    process.stderr.write(`Embedding ${Math.min(index + batch.length, chunks.length)} / ${chunks.length}\r`);
    const vectors = await embed(accountId, token, batch.map((chunk) => chunk.text));
    batch.forEach((chunk, offset) => lines.push(JSON.stringify({id: chunk.id, values: vectors[offset], metadata: chunk.metadata})));
  }
  fs.writeFileSync(output, `${lines.join("\n")}\n`, "utf8");
  process.stderr.write("\n");
  process.stdout.write(`${JSON.stringify({output, corpusVersion, lectures: loaded.lectures.length, vectors: chunks.length, dimensions: 1024, model: MODEL}, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
