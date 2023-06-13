
/**
 * @type {Partial<import('@visactor/bundler').Config>}
 */
module.exports = {
  formats: ["cjs", "es", "umd"],
  name: 'ReactVRender.Utils',
  umdOutputFilename: 'index',
  globals: {
    '@visactor/vrender': 'VRender',
    '@visactor/vutils': 'VUtils',
    'react-reconciler': 'ReactReconciler',
    '@visactor/react-vrender': 'ReactVRender'
  },
  external: [
    "@visactor/vrender",
    "@visactor/vutils",
    "react-reconciler",
    "@visactor/react-vrender"
  ]
};
