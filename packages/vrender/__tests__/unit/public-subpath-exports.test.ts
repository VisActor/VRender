/**
 * @jest-environment node
 */

declare const __dirname: string;
declare const require: any;
export {};

const fs = require('fs');
const path = require('path');

const packageRoot = path.resolve(__dirname, '../..');
const packagesRoot = path.resolve(packageRoot, '..');

type ExpectedSubpath = {
  subpath: string;
  source: string;
};

const expectedExports: Record<string, ExpectedSubpath[]> = {
  'vrender-kits': [
    { subpath: './register/register-line', source: 'src/register/register-line.ts' },
    { subpath: './register/register-symbol', source: 'src/register/register-symbol.ts' },
    { subpath: './register/register-group', source: 'src/register/register-group.ts' },
    { subpath: './register/register-shadowRoot', source: 'src/register/register-shadowRoot.ts' },
    { subpath: './env/browser', source: 'src/env/browser.ts' },
    { subpath: './event/extension', source: 'src/event/extension/index.ts' },
    { subpath: './installers/app', source: 'src/installers/app.ts' },
    { subpath: './tools/dynamicTexture/effect', source: 'src/tools/dynamicTexture/effect.ts' }
  ],
  'vrender-components': [
    { subpath: './label/dataLabel', source: 'src/label/dataLabel.ts' },
    { subpath: './label/line', source: 'src/label/line.ts' },
    { subpath: './label/symbol', source: 'src/label/symbol.ts' },
    { subpath: './axis/line', source: 'src/axis/line.ts' },
    { subpath: './axis/grid/line', source: 'src/axis/grid/line.ts' },
    { subpath: './axis/tick-data', source: 'src/axis/tick-data/index.ts' },
    { subpath: './crosshair/line', source: 'src/crosshair/line.ts' },
    { subpath: './crosshair/rect', source: 'src/crosshair/rect.ts' },
    { subpath: './legend/discrete', source: 'src/legend/discrete/index.ts' },
    { subpath: './tooltip', source: 'src/tooltip/index.ts' },
    { subpath: './poptip/register', source: 'src/poptip/register.ts' },
    { subpath: './util/text', source: 'src/util/text.ts' }
  ],
  'vrender-animate': [
    { subpath: './register', source: 'src/register.ts' },
    { subpath: './custom/scale', source: 'src/custom/scale.ts' },
    { subpath: './custom/groupFade', source: 'src/custom/groupFade.ts' },
    { subpath: './custom/tag-points', source: 'src/custom/tag-points.ts' },
    { subpath: './executor/animate-executor', source: 'src/executor/animate-executor.ts' }
  ],
  vrender: [
    { subpath: './entries/shared', source: 'src/entries/shared.ts' },
    { subpath: './entries/browser', source: 'src/entries/browser.ts' },
    { subpath: './entries/node', source: 'src/entries/node.ts' },
    { subpath: './entries/miniapp', source: 'src/entries/miniapp.ts' }
  ]
};

const expectedTypesVersions: Record<string, Record<string, string[]>> = {
  'vrender-kits': {
    'env/*': ['es/env/*'],
    'event/extension/*': ['es/event/extension/*'],
    'installers/*': ['es/installers/*'],
    'jsx/*': ['es/jsx/*'],
    'picker/*': ['es/picker/*'],
    'register/*': ['es/register/*'],
    'tools/*': ['es/tools/*']
  },
  'vrender-components': {
    'axis/*': ['es/axis/*'],
    'crosshair/*': ['es/crosshair/*'],
    'label/*': ['es/label/*'],
    'legend/*': ['es/legend/*'],
    'poptip/*': ['es/poptip/*'],
    'tag/*': ['es/tag/*'],
    'tooltip/*': ['es/tooltip/*'],
    'util/*': ['es/util/*']
  },
  'vrender-animate': {
    'custom/*': ['es/custom/*'],
    'executor/*': ['es/executor/*'],
    register: ['es/register.d.ts'],
    'state/*': ['es/state/*'],
    'ticker/*': ['es/ticker/*']
  },
  vrender: {
    entries: ['es/entries/index.d.ts'],
    'entries/*': ['es/entries/*']
  }
};

function readPackageJson(packageName: string) {
  return require(path.join(packagesRoot, packageName, 'package.json'));
}

describe('published public subpath exports', () => {
  Object.entries(expectedExports).forEach(([packageName, subpaths]) => {
    test(`${packageName} exposes stable narrow subpaths`, () => {
      const packageJson = readPackageJson(packageName);

      subpaths.forEach(({ subpath, source }) => {
        const entry = packageJson.exports?.[subpath];
        const expectedImport = `./es/${source.replace(/^src\//, '').replace(/\.ts$/, '.js')}`;
        const expectedRequire = `./cjs/${source.replace(/^src\//, '').replace(/\.ts$/, '.js')}`;
        const expectedTypes = `./es/${source.replace(/^src\//, '').replace(/\.ts$/, '.d.ts')}`;

        expect(fs.existsSync(path.join(packagesRoot, packageName, source))).toBe(true);
        expect(entry).toEqual({
          types: expectedTypes,
          import: expectedImport,
          require: expectedRequire
        });
      });
    });

    test(`${packageName} keeps subpath types resolvable without source path aliases`, () => {
      const packageJson = readPackageJson(packageName);

      expect(packageJson.typesVersions?.['*']).toEqual(expect.objectContaining(expectedTypesVersions[packageName]));
    });
  });
});
