/**
 * @type {Partial<import('@visactor/bundler').Config>}
 */
module.exports = {
  formats: ['cjs', 'es', 'umd'],
  name: 'VRenderCore',
  umdOutputFilename: 'index',
  external: ['@visactor/vutils'],
  globals: {
    '@visactor/vutils': 'VUtils'
  }
};
