/**
 * @jest-environment node
 */

declare const require: any;
export {};

const fs = require('fs');
const path = require('path');
const process = require('process');

const workspaceRoot = path.resolve(process.cwd(), '../..');
const packagesRoot = path.join(workspaceRoot, 'packages');
const rootBundlePath = 'dist/index.es.js';
const scannedBuildRoots = ['dist', 'es'];

function readText(absolutePath: string): string {
  return fs.readFileSync(absolutePath, 'utf8');
}

function collectPackageDirs(): string[] {
  return fs
    .readdirSync(packagesRoot)
    .filter((dir: string) => fs.existsSync(path.join(packagesRoot, dir, 'package.json')))
    .sort();
}

function collectArtifactFiles(packageRoot: string, relativeDir: string): string[] {
  const absoluteDir = path.join(packageRoot, relativeDir);

  if (!fs.existsSync(absoluteDir)) {
    return [];
  }

  return fs
    .readdirSync(absoluteDir, { withFileTypes: true })
    .flatMap((entry: { isDirectory: () => boolean; name: string }) => {
      const relativePath = path.join(relativeDir, entry.name);

      if (entry.isDirectory()) {
        return collectArtifactFiles(packageRoot, relativePath);
      }

      return entry.name.endsWith('.js') ? [relativePath] : [];
    });
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

function collectRootNamedImports(artifact: string, packageName: string): string[] {
  const imports = new Set<string>();
  const escapedPackageName = packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const importPattern = new RegExp(`import\\s+\\{([^}]+)\\}\\s+from\\s+['"]${escapedPackageName}['"]`, 'g');
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

describe('published root bundle imports', () => {
  test('root named imports between VRender package artifacts should exist in target root bundle exports', () => {
    const packages = collectPackageDirs()
      .map((dir: string) => {
        const packageRoot = path.join(packagesRoot, dir);
        const bundlePath = path.join(packageRoot, rootBundlePath);

        if (!fs.existsSync(bundlePath)) {
          return null;
        }

        const packageJson = JSON.parse(readText(path.join(packageRoot, 'package.json')));
        const artifact = readText(bundlePath);

        return {
          name: packageJson.name,
          dir,
          packageRoot,
          artifactFiles: scannedBuildRoots.flatMap(relativeDir => collectArtifactFiles(packageRoot, relativeDir)),
          exports: new Set(collectBundleNamedExports(artifact))
        };
      })
      .filter(Boolean);

    const failures: string[] = [];

    packages.forEach((sourcePackage: { name: string; dir: string; packageRoot: string; artifactFiles: string[] }) => {
      sourcePackage.artifactFiles.forEach((relativePath: string) => {
        const artifact = readText(path.join(sourcePackage.packageRoot, relativePath));

        packages.forEach((targetPackage: { name: string; dir: string; exports: Set<string> }) => {
          const rootImports = collectRootNamedImports(artifact, targetPackage.name);
          const missingImports = rootImports.filter(name => !targetPackage.exports.has(name));

          if (missingImports.length) {
            failures.push(
              `${sourcePackage.name}/${relativePath} imports ${targetPackage.name} missing: ${missingImports.join(
                ', '
              )}`
            );
          }
        });
      });
    });

    expect(failures).toEqual([]);
  });
});
