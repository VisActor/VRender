
/**
 * @type {Partial<import('@visactor/bundler').Config>}
 */
module.exports = {
  formats: ["cjs", "es", "umd"],
  name: 'VRender',
  umdOutputFilename: 'vrender.js',
  globals: {
    '@visactor/vutils': 'VUtils'
  },
  external: [
    "@visactor/vutils"
  ]
};
