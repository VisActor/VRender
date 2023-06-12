
/**
 * @type {Partial<import('@visactor/bundler').Config>}
 */
module.exports = {
  formats: ["cjs", "es", "umd"],
  name: 'ReactVRender',
  umdOutputFilename: 'reactvrender',
  globals: {
    '@visactor/vrender': 'VRender',
    '@visactor/vutils': 'VUtils'
  },
  external: [
    "@visactor/vrender",
    "@visactor/vutils"
  ]
};
