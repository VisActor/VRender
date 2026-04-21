declare const require: any;
export {};

const fs = require('fs');
const path = require('path');
const process = require('process');

const packageRoot = process.cwd();
const buildRoots = ['es', 'cjs'];
const artifactExtensions = new Set(['.js', '.d.ts']);
const forbiddenWorkspaceSourcePatterns = [
  /(?:^|[./-])vrender-core\/src\b/,
  /(?:^|[./-])vrender-animate\/src\b/,
  /(?:^|[./-])vrender-kits\/src\b/,
  /(?:^|[./-])vrender\/src\b/
];

function collectArtifactFiles(relativeDir: string): string[] {
  const absoluteDir = path.join(packageRoot, relativeDir);
  if (!fs.existsSync(absoluteDir)) {
    return [];
  }

  const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });
  return entries.flatMap((entry: { isDirectory: () => boolean; name: string }) => {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      return collectArtifactFiles(relativePath);
    }

    const extension = path.extname(entry.name);
    return artifactExtensions.has(extension) ? [relativePath] : [];
  });
}

describe('vrender-kits published artifacts', () => {
  test('should not reference workspace source directories', () => {
    const offenders = buildRoots.flatMap(buildRoot =>
      collectArtifactFiles(buildRoot).flatMap(relativePath => {
        const artifact = fs.readFileSync(path.join(packageRoot, relativePath), 'utf8');
        return forbiddenWorkspaceSourcePatterns.some(pattern => pattern.test(artifact)) ? [relativePath] : [];
      })
    );

    expect(offenders).toEqual([]);
  });
});
