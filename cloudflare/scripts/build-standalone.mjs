import {mkdir, readFile, readdir, rm, stat, writeFile} from "node:fs/promises";
import {dirname, extname, join, relative, sep} from "node:path";
import {fileURLToPath} from "node:url";

import {build} from "esbuild";

const cloudflareRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const projectRoot = dirname(cloudflareRoot);
const clientRoot = join(projectRoot, "dist", "client");
const generatedRoot = join(cloudflareRoot, ".generated");
const outputRoot = join(cloudflareRoot, "dist-standalone");

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"]
]);

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

const assets = {};
for (const fullPath of await walk(clientRoot)) {
  const urlPath = `/${relative(clientRoot, fullPath).split(sep).join("/")}`;
  assets[urlPath] = {
    body: await readFile(fullPath, "utf8"),
    contentType: contentTypes.get(extname(fullPath).toLowerCase()) || "application/octet-stream"
  };
}

await rm(generatedRoot, {recursive: true, force: true});
await rm(outputRoot, {recursive: true, force: true});
await mkdir(generatedRoot, {recursive: true});
await mkdir(outputRoot, {recursive: true});

const entryPath = join(generatedRoot, "standalone-entry.mjs");
await writeFile(
  entryPath,
  `import {createWorker} from "../src/index.mjs";\nconst embeddedAssets = ${JSON.stringify(assets)};\nexport default createWorker({embeddedAssets});\n`,
  "utf8"
);

const outputPath = join(outputRoot, "index.js");
await build({
  entryPoints: [entryPath],
  outfile: outputPath,
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  sourcemap: false,
  minify: false,
  legalComments: "none"
});

const outputStats = await stat(outputPath);
console.log(`Prepared ${Object.keys(assets).length} embedded assets in ${outputStats.size} bytes.`);
