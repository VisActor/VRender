import { defineConfig } from 'vite';
import * as path from 'path';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

export default defineConfig({
  server: {
    open: true,
    port: 3012
  },
  resolve: {
    alias: {
      '@visactor/vrender': path.resolve('../../packages/vrender/src/index.ts'),
      '@visactor/vrender-kits': path.resolve('../../packages/vrender-kits/src/index.ts'),
      util: 'rollup-plugin-node-polyfills/polyfills/util'
    }
  },
  define: {
    'process.env': {},
    __DEV__: true
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true
        }),
        NodeModulesPolyfillPlugin()
      ]
    }
  },
  build: {
    rollupOptions: {
      plugins: [
        // Enable rollup polyfills plugin
        // used during production bundling
        rollupNodePolyFill()
      ]
    }
  }
  // plugins: [
  //   typescript({
  //     clean: true,
  //     include: ['src/**/*.ts+(|x)']
  //   }),
  // ]
});
