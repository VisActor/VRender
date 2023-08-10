/**
 * @type {Partial<import('@visactor/bundler').Config>}
 */
module.exports = {
  formats: ['cjs', 'es', 'umd'],
  name: 'VRender.Kits',
  umdOutputFilename: 'index',
  globals: {
    inversify: 'inversify',
    '@visactor/vrender': 'VRender',
    '@visactor/vutils': 'VUtils'
  },
  external: ['inversify', 'core-js/proposals/reflect-metadata', '@visactor/vrender', '@visactor/vutils']
};
