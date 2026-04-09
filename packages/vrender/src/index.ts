import { Direction } from '@visactor/vrender-core';
// 导出版本号
export const version = __VERSION__;

export * from '@visactor/vrender-core';
export * from '@visactor/vrender-kits';
export * from '@visactor/vrender-animate';
export * from '@visactor/vrender-components';
export * from './entries';
export { createStage } from './legacy';

// avoid naming conflicts with 'State' & 'Direction' in '@visactor/vrender-components'
export { State } from '@visactor/vrender-animate';
export { Direction };
