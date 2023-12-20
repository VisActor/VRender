import type { RollupOptions, Plugin } from 'rollup';
import type { RawPackageJson } from './package';
import type { BabelPlugins } from './babel.config';
import path from 'path';

import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import url from '@rollup/plugin-url';
import Alias from '@rollup/plugin-alias';
import { visualizer } from 'rollup-plugin-visualizer';
import type { Config } from './config';

function getExternal(
  rawPackageJson: RawPackageJson,
  userExternal: string[] | ((rawPackageJson: RawPackageJson) => string[])
): string[] {
  if (typeof userExternal === 'function') {
    return userExternal(rawPackageJson);
  }
  if (Array.isArray(userExternal) && userExternal.length) {
    return userExternal;
  }
  return Object.keys(rawPackageJson.peerDependencies || {});
}

export function getRollupOptions(
  projectRoot: string,
  entry: string,
  rawPackageJson: RawPackageJson,
  babelPlugins: BabelPlugins,
  config: Config
): RollupOptions {
  const analysisPlugins = config.analysis
    ? [
        visualizer({
          open: true,
          gzipSize: true,
          emitFile: true,
          template: 'treemap'
        })
      ]
    : [];

  return {
    input: entry,
    external: getExternal(rawPackageJson, config.external),
    ...config.rollupOptions,
    plugins: [
      resolve(),
      commonjs(),
      babel({ ...babelPlugins, babelHelpers: 'bundled' }),
      replace({ ...config.envs, preventAssignment: true }),
      typescript({
        tsconfig: path.resolve(projectRoot, config.tsconfig),
        compilerOptions: {
          sourceMap: false,
          declaration: false
        }
      }),
      url({
        limit: 8192, // 小于 8kb 的图片将被转换为 base64
        include: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
        fileName: 'static/media/[name].[hash:8].[ext]',
        publicPath: '/',
        destDir: path.resolve(projectRoot, config.outputDir.umd!)
      }),
      Alias({ entries: config.alias }),
      ...analysisPlugins,
      ...(config.minify ? [terser()] : []),
      ...((config.rollupOptions.plugins as Plugin[]) || [])
    ]
  };
}
