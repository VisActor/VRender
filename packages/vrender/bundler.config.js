/**
 * @type {Partial<import('@visactor/bundler').Config>}
 */
module.exports = {
  formats: ['umd'],
  name: 'VRender',
  umdOutputFilename: 'index',
  external: [],
  globals: {
    '@visactor/vutils': 'VUtils'
  }
};
