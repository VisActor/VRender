
/**
 * @type {Partial<import('@visactor/bundler').Config>}
 */
module.exports = {
  formats: ["cjs", "es", "umd"],
  name: 'ReactVRender',
  umdOutputFilename: 'index',
  globals: {
    '@visactor/vrender': 'VRender',
    '@visactor/vutils': 'VUtils',
    'react-reconciler': 'ReactReconciler'
  },
  external: [
    "@visactor/vrender",
    "@visactor/vutils",
    "react-reconciler"
  ]
};
