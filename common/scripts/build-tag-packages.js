const { spawnSync } = require('child_process');
const path = require('path');
const getPackageJson = require('./get-package-json');

const REPO_ROOT = path.join(__dirname, '../..');
const RUSHX_SCRIPT = path.join(REPO_ROOT, 'common/scripts/install-run-rushx.js');

const TAGGED_PACKAGE_BUILD_ORDER = [
  '@visactor/vrender-core',
  '@visactor/vrender-animate',
  '@visactor/vrender-kits',
  '@visactor/vrender-components',
  '@visactor/vrender',
  '@visactor/react-vrender',
  '@visactor/react-vrender-utils'
];

function assertTaggedPackageCoverage() {
  const rushJson = getPackageJson(path.join(REPO_ROOT, 'rush.json'));
  const taggedPackages = rushJson.projects
    .filter(project => Array.isArray(project.tags) && project.tags.includes('package'))
    .map(project => project.packageName);

  const missing = taggedPackages.filter(packageName => !TAGGED_PACKAGE_BUILD_ORDER.includes(packageName));
  const extra = TAGGED_PACKAGE_BUILD_ORDER.filter(packageName => !taggedPackages.includes(packageName));

  if (missing.length || extra.length) {
    throw new Error([
      'TAGGED_PACKAGE_BUILD_ORDER is out of sync with rush.json package tags.',
      missing.length ? `Missing: ${missing.join(', ')}` : '',
      extra.length ? `Extra: ${extra.join(', ')}` : ''
    ].filter(Boolean).join('\n'));
  }

  return rushJson.projects.reduce((projectByName, project) => {
    projectByName[project.packageName] = project;
    return projectByName;
  }, {});
}

function runPackageBuild(project) {
  console.log(`\n[release-build] ${project.packageName}`);

  // `--clean` avoids stale build handles that can keep some package builds open.
  const result = spawnSync(process.execPath, [RUSHX_SCRIPT, 'build', '--clean'], {
    cwd: path.join(REPO_ROOT, project.projectFolder),
    stdio: 'inherit',
    shell: false
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function buildTagPackages() {
  const projectByName = assertTaggedPackageCoverage();

  TAGGED_PACKAGE_BUILD_ORDER.forEach(packageName => {
    runPackageBuild(projectByName[packageName]);
  });
}

module.exports = {
  buildTagPackages,
  TAGGED_PACKAGE_BUILD_ORDER
};
