/**
 * @type {Partial<import('@visactor/bundler').Config>}
 */
module.exports = {
  formats: ['cjs', 'es'],
  name: 'VRender.Components',
  umdOutputFilename: 'index',
  globals: {
    '@visactor/vrender': 'VRender',
    '@visactor/vutils': 'VUtils',
    '@visactor/vscale': 'VScale'
  },
  external: ['@visactor/vrender', '@visactor/vutils', '@visactor/vscale']
};
