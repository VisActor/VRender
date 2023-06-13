
/**
 * @type {Partial<import('@visactor/bundler').Config>}
 */
module.exports = {
  formats: ["cjs", "es", "umd"],
  name: 'VRender.Kits',
  umdOutputFilename: 'index',
  globals: {
    'inversify': 'inversify',
    'reflect-metadata': 'reflectMetadata',
    '@visactor/vrender': 'VRender',
    '@visactor/vutils': 'VUtils'
  },
  external: [
    'inversify',
    'reflect-metadata',
    "@visactor/vrender",
    "@visactor/vutils"
  ]
};
