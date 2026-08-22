import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");

const publicFiles = [
  "app/t6.html",
  "app/t6.css",
  "app/t6.js",
  // Loaded synchronously in <head> so the theme is set before the first paint; it
  // cannot be inline because the release serves `script-src 'self'`.
  "app/theme.js",
  "app/login.html",
  // The privacy notice must be readable before anyone signs in or consents,
  // so it ships as its own page and is routed outside the session gate.
  "app/privacy.html",
  "app/login.css",
  "app/login.js",
  "app/admin.html",
  "app/admin.css",
  "app/admin.js",
  "app/robots.txt",
  "app/sets/t6_lessons.js",
  "app/sets/t6_diagnoses.js",
  "app/sets/t6_brgsa.js",
  "app/sets/t6_catalog.js",
  "app/sets/t6_integrated.js",
  "app/sets/t6_ibm_case.js",
  "app/sets/t6_challenges.js",
  "app/sets/t6_final_sprints.js",
  "app/sets/t6_mini_mocks.js",
  "app/sets/t6_paper_pattern.js",
  "app/sets/t6_coverage.js",
  "app/vendor/gsap.min.js"
];

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, "client"), { recursive: true });
await mkdir(join(dist, "server"), { recursive: true });

for (const relativePath of publicFiles) {
  const destination = join(dist, "client", relativePath);
  await mkdir(dirname(destination), { recursive: true });
  await cp(join(root, relativePath), destination);
}

const workerSource = await readFile(join(root, "sites-backup", "worker.mjs"), "utf8");
await writeFile(join(dist, "server", "index.js"), workerSource, "utf8");

const releaseManifest = {
  generatedAt: new Date().toISOString(),
  route: "/app/t6.html",
  health: "/health",
  storage: "cloudflare-d1-with-browser-fallback",
  files: publicFiles
};

const serializedManifest = `${JSON.stringify(releaseManifest, null, 2)}\n`;
await writeFile(join(dist, "release-manifest.json"), serializedManifest, "utf8");
await writeFile(join(dist, "client", "release-manifest.json"), serializedManifest, "utf8");

console.log(`Prepared ${publicFiles.length} public assets and the production worker.`);
