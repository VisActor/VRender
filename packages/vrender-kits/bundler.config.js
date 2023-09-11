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
  external: ['inversify', '@visactor/vrender', '@visactor/vutils']
};
