
/**
 * @type {Partial<import('@visactor/bundler').Config>}
 */
module.exports = {
  formats: ["cjs", "es", "umd"],
  name: 'ReactVRender.Utils',
  umdOutputFilename: 'reactvrender.utils',
  globals: {
    '@visactor/vrender': 'VRender',
    '@visactor/vutils': 'VUtils',
    '@visactor/vutils': 'VUtils'
  },
  external: [
    "@visactor/vrender",
    "@visactor/vutils",
    "@visactor/vutils"
  ]
};
