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
