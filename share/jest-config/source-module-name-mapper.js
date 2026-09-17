const path = require('path');

const packagesRoot = path.resolve(__dirname, '../../packages');

// Public subpaths whose source filenames differ from their import paths.
const mapper = {
  '^@visactor/vrender-core/event/constant$': path.join(packagesRoot, 'vrender-core/src/event/public-constant.ts'),
  '^@visactor/vrender-core/render/draw-interceptor$': path.join(
    packagesRoot,
    'vrender-core/src/render/contributions/render/draw-interceptor.ts'
  ),
  '^@visactor/vrender-core/render/symbol$': path.join(
    packagesRoot,
    'vrender-core/src/render/contributions/render/symbol.ts'
  )
};

for (const packageName of [
  'vrender',
  'vrender-core',
  'vrender-kits',
  'vrender-animate',
  'vrender-components',
  'react-vrender',
  'react-vrender-utils'
]) {
  mapper[`^@visactor/${packageName}$`] = path.join(packagesRoot, packageName, 'src/index.ts');
  mapper[`^@visactor/${packageName}/(.*)$`] = path.join(packagesRoot, packageName, 'src/$1');
}

module.exports = mapper;
