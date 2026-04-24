declare const require: any;
export {};

const fs = require('fs');
const path = require('path');
const process = require('process');
const { version } = require('../../package.json');

const packageRoot = process.cwd();
const artifactFiles = ['es/index.js', 'es/index.d.ts', 'cjs/index.js', 'cjs/index.d.ts'];
const browserEntryFiles = [
  'es/entries/browser.js',
  'es/entries/browser.d.ts',
  'cjs/entries/browser.js',
  'cjs/entries/browser.d.ts'
];
const nodeEntryFiles = ['es/entries/node.js', 'es/entries/node.d.ts', 'cjs/entries/node.js', 'cjs/entries/node.d.ts'];

function readArtifact(relativePath: string) {
  return fs.readFileSync(path.join(packageRoot, relativePath), 'utf8');
}

describe('vrender published root artifacts', () => {
  test.each(artifactFiles)('%s should re-export app-scoped entries and legacy createStage', relativePath => {
    const artifact = readArtifact(relativePath);

    expect(artifact).toContain('./entries');
    expect(artifact).toContain('createStage');
  });

  test.each(artifactFiles)('%s should embed the current package version', relativePath => {
    const artifact = readArtifact(relativePath);

    expect(artifact).toContain(version);
  });

  test.each(browserEntryFiles)('%s should contain the browser app creator', relativePath => {
    const artifact = readArtifact(relativePath);

    expect(artifact).toContain('createBrowserVRenderApp');
  });

  test.each(browserEntryFiles.filter(path => path.endsWith('.d.ts')))(
    '%s should expose the browser app creator as an IApp factory',
    relativePath => {
      const artifact = readArtifact(relativePath);

      expect(artifact).toContain('IApp');
      expect(artifact).not.toContain('): object;');
    }
  );

  test.each(nodeEntryFiles)('%s should contain the node app creator', relativePath => {
    const artifact = readArtifact(relativePath);

    expect(artifact).toContain('createNodeVRenderApp');
  });

  test.each(nodeEntryFiles.filter(path => path.endsWith('.d.ts')))(
    '%s should expose the node app creator as an IApp factory',
    relativePath => {
      const artifact = readArtifact(relativePath);

      expect(artifact).toContain('IApp');
      expect(artifact).not.toContain('): object;');
    }
  );

  test('cjs root entry should expose app-scoped runtime exports', () => {
    const vrender = require(path.join(packageRoot, 'cjs/index.js'));

    expect(typeof vrender.createBrowserVRenderApp).toBe('function');
    expect(typeof vrender.createNodeVRenderApp).toBe('function');
    expect(typeof vrender.createStage).toBe('function');
  });
});
