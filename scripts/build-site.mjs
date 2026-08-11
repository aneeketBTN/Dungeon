import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");

const publicFiles = [
  "mock/t6.html",
  "mock/t6.css",
  "mock/t6.js",
  "mock/admin.html",
  "mock/admin.css",
  "mock/admin.js",
  "mock/robots.txt",
  "mock/sets/t6_brgsa.js",
  "mock/sets/t6_catalog.js",
  "mock/sets/t6_challenges.js"
];

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, "client"), { recursive: true });
await mkdir(join(dist, "server"), { recursive: true });

for (const relativePath of publicFiles) {
  const destination = join(dist, "client", relativePath);
  await mkdir(dirname(destination), { recursive: true });
  await cp(join(root, relativePath), destination);
}

const workerSource = await readFile(join(root, "site", "worker.mjs"), "utf8");
await writeFile(join(dist, "server", "index.js"), workerSource, "utf8");

const releaseManifest = {
  generatedAt: new Date().toISOString(),
  route: "/mock/t6.html",
  health: "/health",
  storage: "browser-local",
  files: publicFiles
};

await writeFile(
  join(dist, "release-manifest.json"),
  `${JSON.stringify(releaseManifest, null, 2)}\n`,
  "utf8"
);

console.log(`Prepared ${publicFiles.length} public assets and the production worker.`);
