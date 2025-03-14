// 导出接口
export * from './intreface/animate';
export * from './intreface/timeline';
export * from './intreface/easing';
export * from './intreface/type';

// 导出实现
export { Animate } from './animate';
export { DefaultTimeline } from './timeline';
export { ManualTicker } from './ticker/manual-ticker';
export { DefaultTicker } from './ticker/default-ticker';
export { Step } from './step';

// 导出工具函数
export * from './utils/easing-func';
