/**
 * @type {Partial<import('@visactor/bundler').Config>}
 */
module.exports = {
  formats: ['cjs', 'es'],
  name: 'VRender.Kits',
  umdOutputFilename: 'index',
  globals: {
    '@visactor/vrender-core': 'VRenderCore',
    '@visactor/vutils': 'VUtils'
  },
  external: ['@visactor/vrender-core', '@visactor/vutils']
};
