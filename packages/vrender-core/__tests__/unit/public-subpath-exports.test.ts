/**
 * @jest-environment node
 */

declare const __dirname: string;
declare const require: any;
export {};

const fs = require('fs');
const path = require('path');

const packageRoot = path.resolve(__dirname, '../..');
const packageJson = require(path.join(packageRoot, 'package.json'));

type ExpectedSubpath = {
  subpath: string;
  source: string;
};

const expectedExports: ExpectedSubpath[] = [
  { subpath: './graphic/creator', source: 'src/graphic/creator.ts' },
  { subpath: './graphic/base', source: 'src/graphic/base.ts' },
  { subpath: './graphic/modules', source: 'src/graphic/modules.ts' },
  { subpath: './graphic/symbol', source: 'src/graphic/symbol.ts' },
  { subpath: './global', source: 'src/global.ts' },
  { subpath: './env', source: 'src/env.ts' },
  { subpath: './container', source: 'src/container.ts' },
  { subpath: './plugin/attribute', source: 'src/plugin/attribute.ts' },
  { subpath: './plugin/3d', source: 'src/plugin/3d.ts' },
  { subpath: './plugin/flex-layout', source: 'src/plugin/flex-layout.ts' },
  { subpath: './event/constant', source: 'src/event/public-constant.ts' },
  { subpath: './constants', source: 'src/constants.ts' },
  { subpath: './color-string', source: 'src/color-string/index.ts' },
  { subpath: './interpolate', source: 'src/interpolate.ts' },
  { subpath: './text', source: 'src/text.ts' },
  { subpath: './svg', source: 'src/svg.ts' },
  { subpath: './path', source: 'src/path.ts' },
  { subpath: './application', source: 'src/application.ts' },
  { subpath: './common/generator', source: 'src/common/generator.ts' },
  { subpath: './common/diff', source: 'src/common/diff.ts' },
  { subpath: './common/performance-raf', source: 'src/common/performance-raf.ts' },
  { subpath: './graphic/builtin-symbol', source: 'src/graphic/builtin-symbol.ts' },
  { subpath: './graphic/group', source: 'src/graphic/group.ts' },
  { subpath: './legacy/bootstrap', source: 'src/legacy/bootstrap.ts' },
  { subpath: './picker/constants', source: 'src/picker/constants.ts' },
  { subpath: './register/graphic', source: 'src/register/graphic.ts' },
  { subpath: './render/draw-interceptor', source: 'src/render/contributions/render/draw-interceptor.ts' },
  { subpath: './render/symbol', source: 'src/render/contributions/render/symbol.ts' },
  { subpath: './entries/browser', source: 'src/entries/browser.ts' },
  { subpath: './entries/runtime-installer', source: 'src/entries/runtime-installer.ts' }
];

describe('vrender-core public subpath exports', () => {
  test('exposes stable narrow subpaths with import, require, and types targets', () => {
    expectedExports.forEach(({ subpath, source }) => {
      const entry = packageJson.exports?.[subpath];
      const expectedImport = `./es/${source.replace(/^src\//, '').replace(/\.ts$/, '.js')}`;
      const expectedRequire = `./cjs/${source.replace(/^src\//, '').replace(/\.ts$/, '.js')}`;
      const expectedTypes = `./es/${source.replace(/^src\//, '').replace(/\.ts$/, '.d.ts')}`;

      expect(fs.existsSync(path.join(packageRoot, source))).toBe(true);
      expect(entry).toEqual({
        types: expectedTypes,
        import: expectedImport,
        require: expectedRequire
      });
    });
  });

  test('keeps subpath types resolvable without source path aliases', () => {
    const expectedTypesVersions = expectedExports.reduce((entries, { subpath, source }) => {
      entries[subpath.replace(/^\.\//, '')] = [source.replace(/^src\//, 'es/').replace(/\.ts$/, '.d.ts')];
      return entries;
    }, {} as Record<string, string[]>);

    expect(packageJson.typesVersions?.['*']).toEqual(expectedTypesVersions);
  });
});
