declare const require: any;
declare const __dirname: string;
export {};

const fs = require('fs');
const path = require('path');

describe('DefaultWindow bundler scope safety', () => {
  test('does not use global as constructor or active local binding name', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '../../../src/core/window.ts'), 'utf8');

    expect(source).not.toContain('constructor(\n    global:');
    expect(source).not.toContain('constructor(\n    windowGlobal:');
    expect(source).not.toContain('const global = this.global');
    expect(source).not.toContain('const windowGlobal = this.global');
    expect(source).not.toContain('this.global = global');
    expect(source).not.toContain('this.global = windowGlobal');
    expect(source).toContain('vRenderGlobal: IGlobal = application.global');
  });
});
