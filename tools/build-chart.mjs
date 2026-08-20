import { build } from "esbuild";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

await build({
  entryPoints: [join(root, "app", "t6-chart.jsx")],
  outfile: join(root, "app", "t6-chart.js"),
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  minify: true,
  legalComments: "eof",
  sourcemap: false
});

console.log("Built the shared shadcn/Recharts chart island.");
