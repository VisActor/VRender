import * as path from 'path';

export default {
  resolve: {
    alias: {
      '@visactor/vrender': path.resolve('../../packages/vrender/src/index.ts'),
      '@visactor/vrender-core': path.resolve('../../packages/vrender-core/src/index.ts'),
      '@visactor/vrender-kits': path.resolve('../../packages/vrender-kits/src/index.ts'),
      '@visactor/vrender-animate': path.resolve('../../packages/vrender-animate/src/index.ts'),
      '@visactor/vrender-components': path.resolve('../../packages/vrender-components/src/index.ts')
    }
  }
};
