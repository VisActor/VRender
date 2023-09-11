/**
 * @type {Partial<import('@internal/bundler').Config>}
 */
module.exports = {
  formats: ['umd'],
  // name: 'VRender',

  umdOutputFilename: 'index',
  minify: false,
  output: {
    footer: '/* follow me on Twitter! @rich_harris */'
  }
};
