/**
 * @jest-environment node
 */

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
const miniappEntryFiles = [
  'es/entries/miniapp.js',
  'es/entries/miniapp.d.ts',
  'cjs/entries/miniapp.js',
  'cjs/entries/miniapp.d.ts'
];
const miniappCreators = [
  'createTaroVRenderApp',
  'createFeishuVRenderApp',
  'createTTVRenderApp',
  'createWxVRenderApp',
  'createLynxVRenderApp',
  'createHarmonyVRenderApp'
];

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

  test.each(miniappEntryFiles)('%s should contain miniapp app creators', relativePath => {
    const artifact = readArtifact(relativePath);

    miniappCreators.forEach(creator => {
      expect(artifact).toContain(creator);
    });
  });

  test.each(miniappEntryFiles.filter(path => path.endsWith('.d.ts')))(
    '%s should expose miniapp app creators as IApp factories',
    relativePath => {
      const artifact = readArtifact(relativePath);

      expect(artifact).toContain('IApp');
      expect(artifact).not.toContain('): object;');
    }
  );

  test('cjs entries index should re-export app-scoped entry modules', () => {
    const artifact = readArtifact('cjs/entries/index.js');

    expect(artifact).toContain('./browser');
    expect(artifact).toContain('./miniapp');
    expect(artifact).toContain('./node');
  });
});
