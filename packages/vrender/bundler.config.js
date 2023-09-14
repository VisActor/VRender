/**
 * @type {Partial<import('@visactor/bundler').Config>}
 */
module.exports = {
  formats: ['cjs', 'es', 'umd'],
  name: 'VRender',
  umdOutputFilename: 'index',
  external: [],
  globals: {
    '@visactor/vutils': 'VUtils'
  }
};
