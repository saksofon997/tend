const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");
const { resolve: metroResolve } = require("metro-resolver");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const mobileNodeModules = path.resolve(projectRoot, "node_modules");
const workspaceNodeModules = path.resolve(workspaceRoot, "node_modules");
const nodeModuleSearchRoots = [mobileNodeModules, workspaceNodeModules];

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = nodeModuleSearchRoots;

// Prefer explicit monorepo roots over hierarchical lookup so hoisted Bun deps
// (e.g. @expo-google-fonts/* at the workspace root) resolve reliably.
config.resolver.disableHierarchicalLookup = true;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const result = metroResolve(context, moduleName, platform);

  if (result.type !== "failed") {
    return result;
  }

  if (moduleName.startsWith(".") || path.isAbsolute(moduleName)) {
    return result;
  }

  for (const nodeModulesPath of nodeModuleSearchRoots) {
    try {
      const filePath = require.resolve(moduleName, { paths: [nodeModulesPath] });
      return { type: "sourceFile", filePath };
    } catch {
      // try the next monorepo node_modules root
    }
  }

  return result;
};

module.exports = config;
