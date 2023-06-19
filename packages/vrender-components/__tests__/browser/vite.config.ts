import * as path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: './index.html',
    port: 3333
  },
  define: {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    __VERSION__: JSON.stringify(require('../../package.json').version)
  },
  resolve: {
    alias: {
      '@visactor/vrender': path.resolve(__dirname, '../../../vrender/src/index.ts')
    }
  }
});
