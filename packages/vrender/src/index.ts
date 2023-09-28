import { container } from '@visactor/vrender-core';
import { loadAllModule } from '@visactor/vrender-kits';

// 导出版本号
export const version = __VERSION__;

loadAllModule(container);

export * from '@visactor/vrender-core';
export * from '@visactor/vrender-kits';
