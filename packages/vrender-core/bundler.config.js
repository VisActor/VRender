/**
 * @type {Partial<import('@visactor/bundler').Config>}
 */
module.exports = {
  formats: ['cjs', 'es', 'umd'],
  name: 'VRenderCore',
  umdOutputFilename: 'index',
  external: [],
  globals: {
    '@visactor/vutils': 'VUtils'
  }
};
