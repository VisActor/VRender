const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(projectRoot, '../..');
const packageRoot = path.join(projectRoot, 'node_modules/@visactor');

const packages = [
  ['vrender-core', 'vrender-core'],
  ['vrender-kits', 'vrender-kits'],
  ['vrender-animate', 'vrender-animate'],
  ['vrender-components', 'vrender-components'],
  ['vrender', 'vrender']
];

function assertDir(dir, message) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(message);
  }
}

function copyDir(source, target) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function normalizeWorkspaceDeps(deps, fallbackVersion) {
  if (!deps) {
    return deps;
  }

  const normalized = {};
  for (const [name, version] of Object.entries(deps)) {
    if (typeof version === 'string' && version.startsWith('workspace:')) {
      const workspaceVersion = version.slice('workspace:'.length);
      normalized[name] =
        workspaceVersion === '*' ? fallbackVersion : workspaceVersion;
    } else {
      normalized[name] = version;
    }
  }
  return normalized;
}

function writeSanitizedPackageJson(sourcePackageDir, targetPackageDir) {
  const pkg = readJson(path.join(sourcePackageDir, 'package.json'));
  const sanitized = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    sideEffects: pkg.sideEffects,
    main: pkg.main,
    module: pkg.module,
    types: pkg.types,
    dependencies: normalizeWorkspaceDeps(pkg.dependencies, pkg.version),
    peerDependencies: normalizeWorkspaceDeps(pkg.peerDependencies, pkg.version),
    exports: pkg.exports,
    license: pkg.license
  };

  for (const key of Object.keys(sanitized)) {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  }

  fs.writeFileSync(
    path.join(targetPackageDir, 'package.json'),
    `${JSON.stringify(sanitized, null, 2)}\n`
  );
}

function syncPackage(packageFolder, packageName) {
  const sourcePackageDir = path.join(repoRoot, 'packages', packageFolder);
  const targetPackageDir = path.join(packageRoot, packageName);
  const packageJsonPath = path.join(sourcePackageDir, 'package.json');

  assertDir(sourcePackageDir, `Missing VRender package: ${sourcePackageDir}`);
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(
      `Missing package.json for ${packageName}: ${packageJsonPath}`
    );
  }

  const builtDirs = ['cjs', 'es', 'dist'].filter((dir) =>
    fs.existsSync(path.join(sourcePackageDir, dir))
  );
  if (!builtDirs.includes('cjs') || !builtDirs.includes('es')) {
    throw new Error(
      `Missing built output for ${packageName}. Run "rush build -t @visactor/vrender" from ${repoRoot} first.`
    );
  }

  fs.rmSync(targetPackageDir, { recursive: true, force: true });
  fs.mkdirSync(targetPackageDir, { recursive: true });
  writeSanitizedPackageJson(sourcePackageDir, targetPackageDir);

  for (const dir of builtDirs) {
    copyDir(path.join(sourcePackageDir, dir), path.join(targetPackageDir, dir));
  }

  console.log(`synced @visactor/${packageName} from packages/${packageFolder}`);
}

assertDir(
  path.join(projectRoot, 'node_modules'),
  'Run "npm install" in multi-platform/lynx-vrender before sync:local.'
);
fs.mkdirSync(packageRoot, { recursive: true });

for (const [packageFolder, packageName] of packages) {
  syncPackage(packageFolder, packageName);
}
