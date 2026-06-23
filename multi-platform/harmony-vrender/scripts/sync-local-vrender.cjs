const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(projectRoot, '../..');
const outputFile = path.join(projectRoot, 'entry/src/main/ets/vendor/vrender/index.js');
const esbuildPackage = path.join(repoRoot, 'common/temp/node_modules/.pnpm/node_modules/esbuild');
const vrenderPackageJson = path.join(repoRoot, 'packages/vrender/package.json');

function assertFile(file, message) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    throw new Error(message);
  }
}

function assertDir(dir, message) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(message);
  }
}

assertDir(esbuildPackage, `Missing esbuild package: ${esbuildPackage}. Run Rush install/update first.`);
assertFile(vrenderPackageJson, `Missing VRender package.json: ${vrenderPackageJson}`);

const esbuild = require(esbuildPackage);
const vrenderVersion = JSON.parse(fs.readFileSync(vrenderPackageJson, 'utf8')).version;

const workspaceAliases = new Map([
  ['@visactor/vrender-core', 'packages/vrender-core/src/index.ts'],
  ['@visactor/vrender-kits', 'packages/vrender-kits/src/index.ts'],
  ['@visactor/vrender-animate', 'packages/vrender-animate/src/index.ts'],
  ['@visactor/vrender-components', 'packages/vrender-components/src/index.ts']
]);

for (const source of workspaceAliases.values()) {
  assertFile(path.join(repoRoot, source), `Missing VRender source entry: ${source}`);
}

const workspaceAliasPlugin = {
  name: 'vrender-workspace-alias',
  setup(build) {
    build.onResolve({ filter: /^@visactor\/(vrender-core|vrender-kits|vrender-animate|vrender-components)$/ }, args => {
      return {
        path: path.join(repoRoot, workspaceAliases.get(args.path))
      };
    });
  }
};

async function main() {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });

  await esbuild.build({
    entryPoints: [path.join(repoRoot, 'packages/vrender/src/index.ts')],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: ['es2018'],
    define: {
      __DEV__: 'false',
      __VERSION__: JSON.stringify(vrenderVersion)
    },
    outfile: outputFile,
    sourcemap: false,
    legalComments: 'none',
    nodePaths: [path.join(repoRoot, 'common/temp/node_modules/.pnpm/node_modules')],
    plugins: [workspaceAliasPlugin],
    logLevel: 'silent'
  });

  const sizeKb = Math.round(fs.statSync(outputFile).size / 1024);
  console.log(`synced VRender Harmony bundle: ${path.relative(projectRoot, outputFile)} (${sizeKb} KB)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
