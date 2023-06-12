
/**
 * @type {Partial<import('@visactor/bundler').Config>}
 */
module.exports = {
  formats: ["cjs", "es", "umd"],
  name: 'VRender',
  umdOutputFilename: 'index',
  external: [
    "@visactor/vutils",
    'inversify',
    'reflect-metadata'
  ],
  globals: {
    'inversify': 'inversify',
    'reflect-metadata': 'reflectMetadata',
    '@visactor/vutils': 'VUtils'
  }
};
