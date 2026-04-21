declare const require: any;
export {};

const fs = require('fs');
const path = require('path');
const process = require('process');

const packageRoot = process.cwd();

function readArtifact(relativePath: string) {
  return fs.readFileSync(path.join(packageRoot, relativePath), 'utf8');
}

describe('vrender-kits root installer exports', () => {
  test('root artifacts should explicitly expose app installer entry points', () => {
    const esIndex = readArtifact('es/index.js');
    const esTypes = readArtifact('es/index.d.ts');
    const cjsIndexNode = readArtifact('cjs/index-node.js');
    const cjsTypes = readArtifact('cjs/index-node.d.ts');

    expect(esIndex).toContain('installNodeEnvToApp');
    expect(esIndex).toContain('installBrowserEnvToApp');
    expect(esTypes).toContain('installNodeEnvToApp');
    expect(esTypes).toContain('installBrowserEnvToApp');
    expect(cjsIndexNode).toContain('installNodeEnvToApp');
    expect(cjsIndexNode).toContain('installBrowserEnvToApp');
    expect(cjsTypes).toContain('installNodeEnvToApp');
    expect(cjsTypes).toContain('installBrowserEnvToApp');
  });
});
