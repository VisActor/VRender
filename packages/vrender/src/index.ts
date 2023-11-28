import { container, isBrowserEnv, isNodeEnv } from '@visactor/vrender-core';
import { loadBrowserEnv, loadNodeEnv } from '@visactor/vrender-kits';

// 导出版本号
export const version = __VERSION__;

if (isBrowserEnv()) {
  loadBrowserEnv(container);
} else if (isNodeEnv()) {
  loadNodeEnv(container);
}
export * from './register';
export * from '@visactor/vrender-core';
export * from '@visactor/vrender-kits';
