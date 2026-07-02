declare const require: any;
export {};

const fs = require('fs');
const path = require('path');
const process = require('process');

const packageRoot = process.cwd();

function readArtifact(relativePath: string) {
  return fs.readFileSync(path.join(packageRoot, relativePath), 'utf8');
}

describe('vrender-core container compatibility', () => {
  test('application should use realm-level shared state for duplicated ESM entry evaluation', () => {
    const { application } = require(path.join(packageRoot, 'src/application'));
    const state = (globalThis as any)[Symbol.for('@visactor/vrender-core/application-state')];

    expect(state).toBeDefined();
    expect(state.application).toBe(application);
  });

  test('es artifacts should expose legacy container compatibility surface', () => {
    expect(readArtifact('es/modules.js')).toContain('export const container');
    expect(readArtifact('es/modules.d.ts')).toContain('container');
    expect(readArtifact('es/index.d.ts')).toContain("from './modules'");
    expect(readArtifact('es/index.d.ts')).toContain('container');
  });

  test('cjs root export should expose container as the legacy binding context', () => {
    const vrenderCore = require(path.join(packageRoot, 'cjs/index.js'));

    expect(vrenderCore.container).toBe(vrenderCore.getLegacyBindingContext());
  });
});
