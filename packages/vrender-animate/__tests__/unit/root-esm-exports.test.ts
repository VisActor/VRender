import * as fs from 'fs';
import * as path from 'path';

describe('vrender-animate root esm exports', () => {
  test('should expose custom animate registration as an explicit named export', () => {
    const rootEntry = path.resolve(__dirname, '../../src/index.ts');
    const content = fs.readFileSync(rootEntry, 'utf8');

    expect(content).toContain("export { registerCustomAnimate } from './custom/register'");
  });
});
