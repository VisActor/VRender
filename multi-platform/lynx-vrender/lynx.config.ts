import { pluginHDT } from '@byted-lynx/hdt-rsbuild-plugin';
import { pluginReactLynx } from '@byted-lynx/react/rsbuild-plugin';
import { defineConfig } from '@byted-lynx/rspeedy';

declare const process: {
  env: Record<string, string | undefined>;
};

const entry = process.env.LYNX_ENTRY ?? './src/index.tsx';
const distRoot = process.env.LYNX_DIST_ROOT ?? 'dist';

export default defineConfig({
  output: {
    assetPrefix: process.env.ASSET_PREFIX,
    distPath: {
      root: distRoot
    },
    filename: {
      bundle: '[name]/template.js',
      template: '[name]/template.js'
    }
  },
  source: {
    entry: {
      main: entry
    }
  },
  server: {
    host: '0.0.0.0'
  },
  plugins: [
    pluginHDT({
      schema(url) {
        return {
          http: url,
          aweme: `aweme://lynxview/?url=${url}`
        };
      }
    }),
    pluginReactLynx()
  ]
});
