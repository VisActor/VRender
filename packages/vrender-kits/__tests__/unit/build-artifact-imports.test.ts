declare const require: any;
export {};

const fs = require('fs');
const path = require('path');
const process = require('process');

const packageRoot = process.cwd();
const corePackageRoot = path.resolve(packageRoot, '../vrender-core');
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

function readArtifact(packageDir: string, relativePath: string): string {
  return fs.readFileSync(path.join(packageDir, relativePath), 'utf8');
}

function collectRootNamedImports(artifact: string): string[] {
  const imports = new Set<string>();
  const importPattern = /import\s+\{([^}]+)\}\s+from\s+['"]@visactor\/vrender-core['"]/g;
  let match: RegExpExecArray | null;

  while ((match = importPattern.exec(artifact))) {
    match[1]
      .split(',')
      .map(specifier => specifier.trim())
      .filter(Boolean)
      .forEach(specifier => {
        imports.add(specifier.split(/\s+as\s+/)[0].trim());
      });
  }

  return Array.from(imports).sort();
}

function collectBundleNamedExports(artifact: string): string[] {
  const exports = new Set<string>();
  const exportPattern = /export\s+\{([^}]+)\}/g;
  let match: RegExpExecArray | null;

  while ((match = exportPattern.exec(artifact))) {
    match[1]
      .split(',')
      .map(specifier => specifier.trim())
      .filter(Boolean)
      .forEach(specifier => {
        const [, exportedName = specifier] = specifier.match(/\s+as\s+([A-Za-z0-9_$]+)$/) ?? [];
        exports.add(exportedName.trim());
      });
  }

  return Array.from(exports).sort();
}

describe('vrender-kits and vrender-core bundle artifacts', () => {
  test('root named imports from vrender-core should exist in the core root bundle export list', () => {
    const kitsBundle = readArtifact(packageRoot, 'dist/index.es.js');
    const coreBundle = readArtifact(corePackageRoot, 'dist/index.es.js');
    const coreRootImports = collectRootNamedImports(kitsBundle);
    const coreRootExports = new Set(collectBundleNamedExports(coreBundle));
    const missingImports = coreRootImports.filter(name => !coreRootExports.has(name));

    expect(missingImports).toEqual([]);
  });
});
