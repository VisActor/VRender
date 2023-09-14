// import 'core-js/proposals/reflect-metadata';
import './Reflect-metadata';
import './modules';

// 导出版本号
export const version = __VERSION__;

export * from './container';
export * from './core/global';
export * from './graphic';
export * from './modules';
export * from './create';
export * from './event';
export * from './interface';
export * from './render';
export * from './render/contributions/render/base-render';
export * from './canvas';
export * from './core';
export * from './picker';
export * from './kits';
export * from './animate';
export * from './resource-loader/loader';

/* export common */
export * from './common/text';
export * from './common/bezier-utils';
export * from './common/bounds-context';
export * from './common/seg-context';
export * from './common/custom-path2d';
export * from './common/segment';
export * from './common/canvas-utils';
export * from './common/contribution-provider';
export * from './common/generator';
export * from './common/utils';
export * from './common/shape/arc';
export * from './common/shape/rect';

export * from './common/path-svg';
export * from './common/render-curve';
export * from './common/render-area';
export * from './common/render-command-list';
export * from './common/sort';
export * from './common/morphing-utils';
export * from './common/split-path';
export * from './common/enums';
export * from './common/generator';
export * from './plugins/constants';
export * from './allocator/matrix-allocate';

export * from './animate/default-ticker';
export { wrapCanvas, wrapContext } from './canvas/util';
export * from './jsx';
export * from './common/xml';
export * from './common/inversify-lite';
