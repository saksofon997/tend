import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(scriptDir, "..");
const workspaceRoot = path.resolve(mobileRoot, "../..");
const require = createRequire(import.meta.url);

const pkg = JSON.parse(readFileSync(path.join(mobileRoot, "package.json"), "utf8"));
const searchRoots = [
  path.join(mobileRoot, "node_modules"),
  path.join(workspaceRoot, "node_modules"),
];

// Runtime deps only — Metro must resolve these when bundling.
const deps = pkg.dependencies ?? {};

const missing = [];

function canResolve(name, nodeModulesPath) {
  for (const candidate of [name, `${name}/package.json`]) {
    try {
      require.resolve(candidate, { paths: [nodeModulesPath] });
      return true;
    } catch {
      // try package.json path or next root
    }
  }

  return false;
}

for (const [name, spec] of Object.entries(deps)) {
  if (name.startsWith("@tend/")) {
    continue;
  }

  const resolved = searchRoots.some((root) => canResolve(name, root));

  if (!resolved) {
    missing.push(`${name}@${spec}`);
  }
}

if (missing.length > 0) {
  console.error("Mobile dependencies are missing from node_modules:");
  for (const dep of missing) {
    console.error(`  - ${dep}`);
  }
  console.error("\nRun `bun install` from the repo root, then retry.");
  process.exit(1);
}

console.log(`Verified ${Object.keys(deps).length} mobile runtime dependencies.`);
