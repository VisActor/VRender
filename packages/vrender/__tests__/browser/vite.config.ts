import * as path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    open: true,
    port: 3012
  },
  plugins: [
    react({
      babel: {
        plugins: [
          [
            '@babel/plugin-transform-react-jsx',
            {
              pragma: 'jsx',
              pragmaFrag: 'Fragment'
            }
          ]
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@visactor/vrender': path.resolve(__dirname, '../../../vrender/src/index.ts'),
      '@visactor/vrender-kits': path.resolve(__dirname, '../../../vrender-kits/src/index.ts'),
      util: 'rollup-plugin-node-polyfills/polyfills/util'
    }
  },
  define: {
    'process.env': {},
    __DEV__: true,
    __VERSION__: JSON.stringify(require('../../package.json').version)
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      }
      // Enable esbuild polyfill plugins
      // plugins: [
      //   NodeGlobalsPolyfillPlugin({
      //     process: true,
      //     buffer: true
      //   }),
      //   NodeModulesPolyfillPlugin()
      // ]
    }
  },
  build: {
    rollupOptions: {
      plugins: [
        // Enable rollup polyfills plugin
        // used during production bundling
        // rollupNodePolyFill()
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
