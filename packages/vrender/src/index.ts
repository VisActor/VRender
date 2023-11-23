import { container } from '@visactor/vrender-core';
import { loadAllEnv, loadBrowserEnv } from '@visactor/vrender-kits';

// 导出版本号
export const version = __VERSION__;

loadAllEnv(container);

export * from '@visactor/vrender-core';
export * from '@visactor/vrender-kits';
