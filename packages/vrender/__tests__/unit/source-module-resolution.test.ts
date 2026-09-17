/**
 * @jest-environment node
 */

declare const require: any;
declare const __dirname: string;
export {};

const path = require('path');
const packagesRoot = path.resolve(__dirname, '../../..');

describe('workspace source module resolution', () => {
  test.each([
    'vrender',
    'vrender-core',
    'vrender-kits',
    'vrender-animate',
    'vrender-components',
    'react-vrender',
    'react-vrender-utils'
  ])('%s resolves to its own source entry without a build', packageName => {
    expect(require.resolve(`@visactor/${packageName}`)).toBe(path.join(packagesRoot, packageName, 'src/index.ts'));
  });

  test.each([
    ['vrender/entries/node', 'vrender/src/entries/node.ts'],
    ['vrender-core/event/constant', 'vrender-core/src/event/public-constant.ts'],
    ['vrender-core/render/draw-interceptor', 'vrender-core/src/render/contributions/render/draw-interceptor.ts'],
    ['vrender-core/render/symbol', 'vrender-core/src/render/contributions/render/symbol.ts'],
    ['vrender-kits/register/register-line', 'vrender-kits/src/register/register-line.ts'],
    ['vrender-animate/register', 'vrender-animate/src/register.ts'],
    ['vrender-components/brush', 'vrender-components/src/brush/index.ts'],
    ['react-vrender/processProps', 'react-vrender/src/processProps.ts']
  ])('%s resolves to its source subpath', (specifier, source) => {
    expect(require.resolve(`@visactor/${specifier}`)).toBe(path.join(packagesRoot, source));
  });
});
