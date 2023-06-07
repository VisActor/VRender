import * as path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: './index.html',
    port: 3333
  },
  resolve: {
    alias: {
      '@visactor/vrender': path.resolve(__dirname, '../../../vrender/src/index.ts')
    }
  }
});
