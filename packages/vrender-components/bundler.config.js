
/**
 * @type {Partial<import('@visactor/bundler').Config>}
 */
module.exports = {
  formats: ["cjs", "es", "umd"],
  name: 'VRender.Components',
  umdOutputFilename: 'index',
  globals: {
    '@visactor/vrender': 'VRender',
    '@visactor/vutils': 'VUtils',
    '@visactor/vscale': 'VGrammar.Scale'
  },
  external: [
    "@visactor/vrender",
    "@visactor/vutils",
    "@visactor/vscale"
  ]
};
