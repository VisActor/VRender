/**
 * @jest-environment node
 */

declare const __dirname: string;
declare const require: any;
export {};

const fs = require('fs');
const path = require('path');

const entriesRoot = path.resolve(__dirname, '../../src/entries');
const kitsRoot = path.resolve(__dirname, '../../../vrender-kits/src');

const readSources = (root: string, files: string[]) =>
  files.map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');

describe('conditional shared entry isolation', () => {
  test('keeps the browser entry independent from Lynx and multi-environment bootstraps', () => {
    const source = readSources(entriesRoot, ['shared-browser.ts', 'bootstrap-browser.ts']);

    expect(source).not.toMatch(/from ['"]\.\/(?:miniapp|lynx|bootstrap|bootstrap-lynx)['"]/);
  });

  test('keeps the Lynx entry independent from the multi-environment bootstrap', () => {
    const source = readSources(entriesRoot, ['shared-lynx.ts', 'lynx.ts', 'bootstrap-lynx.ts']);
    const installerSource = readSources(kitsRoot, ['installers/lynx.ts']);

    expect(source).not.toMatch(/from ['"]\.\/(?:miniapp|bootstrap)['"]/);
    expect(source).not.toMatch(/@visactor\/vrender-kits\/installers\/app/);
    expect(installerSource).not.toMatch(/\/(?:browser|feishu|harmony|node|taro|tt|wx)(?:\/|['"])/);
  });
});
