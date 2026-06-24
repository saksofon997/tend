import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const bumpTypes = new Set(["major", "minor", "patch"]);

const projects = {
  web: {
    packageJson: "apps/web/package.json",
    versionJsonKey: "app",
  },
  mobile: {
    packageJson: "apps/mobile/package.json",
  },
};

function parseSemver(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);

  if (!match) {
    throw new Error(`Expected a x.y.z semantic version, got "${version}".`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

export function bumpVersion(version, bumpType) {
  if (!bumpTypes.has(bumpType)) {
    throw new Error(`Expected bump type to be one of: ${Array.from(bumpTypes).join(", ")}.`);
  }

  const parts = parseSemver(version);

  if (bumpType === "major") {
    return `${parts.major + 1}.0.0`;
  }

  if (bumpType === "minor") {
    return `${parts.major}.${parts.minor + 1}.0`;
  }

  return `${parts.major}.${parts.minor}.${parts.patch + 1}`;
}

async function readJson(root, relativePath) {
  const filePath = path.join(root, relativePath);
  const raw = await readFile(filePath, "utf8");

  return JSON.parse(raw);
}

async function writeJson(root, relativePath, value) {
  const filePath = path.join(root, relativePath);
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export async function bumpProjectVersion(projectName, bumpType, options = {}) {
  const project = projects[projectName];

  if (!project) {
    throw new Error(`Expected project to be one of: ${Object.keys(projects).join(", ")}.`);
  }

  const root = options.root ?? process.cwd();
  const packageJson = await readJson(root, project.packageJson);
  const currentVersion = packageJson.version;

  if (typeof currentVersion !== "string") {
    throw new Error(`${project.packageJson} must contain a string version.`);
  }

  const nextVersion = bumpVersion(currentVersion, bumpType);
  packageJson.version = nextVersion;
  await writeJson(root, project.packageJson, packageJson);

  const changedFiles = [project.packageJson];

  if (project.versionJsonKey) {
    const versionJsonPath = "version.json";
    const versionJson = await readJson(root, versionJsonPath);
    versionJson[project.versionJsonKey] = nextVersion;
    await writeJson(root, versionJsonPath, versionJson);
    changedFiles.push(versionJsonPath);
  }

  return {
    project: projectName,
    bumpType,
    previousVersion: currentVersion,
    nextVersion,
    changedFiles,
  };
}

function usage() {
  return [
    "Usage: bun run bump <web|mobile> <major|minor|patch>",
    "",
    "Examples:",
    "  bun run bump web minor",
    "  bun run bump mobile major",
    "  bun run bump web patch",
  ].join("\n");
}

async function main(argv) {
  const [projectName, bumpType, ...extraArgs] = argv;

  if (!projectName || !bumpType || extraArgs.length > 0) {
    throw new Error(usage());
  }

  const result = await bumpProjectVersion(projectName, bumpType);
  console.log(
    `${result.project}: ${result.previousVersion} -> ${result.nextVersion} (${result.bumpType})`,
  );
  console.log(`Updated ${result.changedFiles.join(", ")}`);
}

const currentFilePath = fileURLToPath(import.meta.url);

if (process.argv[1] === currentFilePath) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
