import pkg from '../packages/vrender/package.json';
import * as path from 'path';
import react from '@vitejs/plugin-react';

export default {
  optimizeDeps: {},
  server: {
    host: '0.0.0.0',
    port: 3020,
    https: !!process.env.HTTPS,
    open: true
  },
  define: {
    __DEV__: true,
    __VERSION__: JSON.stringify(pkg.version)
  },
  resolve: {
    alias: {
      '@visactor/vrender': path.resolve('../packages/vrender/src/index.ts'),
      '@visactor/vrender-core': path.resolve('../packages/vrender-core/src/index.ts'),
      '@visactor/vrender-kits': path.resolve('../packages/vrender-kits/src/index.ts')
    }
  },
  plugins: [react()]
};
