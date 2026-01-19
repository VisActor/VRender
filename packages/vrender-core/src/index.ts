// import 'core-js/proposals/reflect-metadata';

// 必须在所有其他导出之前加载，确保服务注册表被初始化
import './modules';

export * from './core/global';
export * from './graphic';
export * from './create';
export * from './event';
export * from './interface';
export * from './render';
export * from './render/contributions/render/base-render';
export * from './canvas';
export * from './core';
export * from './core/light';
export * from './core/camera';
export * from './picker';
export * from './resource-loader/loader';
export * from './color-string';
export * from './factory';

/* export common */
export * from './common/text';
export * from './common/color-utils';
export * from './common/bezier-utils';
export * from './common/bounds-context';
export * from './common/seg-context';
export * from './common/custom-path2d';
export * from './common/segment';
export * from './common/canvas-utils';
export * from './common/generator';
export * from './common/utils';
export * from './common/shape/arc';
export * from './common/shape/rect';
export * from './common/matrix';
export * from './common/simplify';
export * from './common/diff';

export * from './common/path-svg';
export * from './common/render-curve';
export * from './common/render-area';
export * from './common/render-command-list';
export * from './common/sort';
export * from './common/morphing-utils';
export * from './common/split-path';
export * from './common/enums';
export * from './common/generator';
export * from './common/performance-raf';
export * from './common/event-transformer';
export * from './plugins/constants';
export * from './plugins/builtin-plugin/richtext-edit-plugin';
export * from './allocator/matrix-allocate';
export * from './allocator/canvas-allocate';
export * from './allocator/graphic-allocate';

export { wrapCanvas, wrapContext } from './canvas/util';
export * from './common/xml';
export * from './constants';
export * from './env-check';
export * from './common/registry'; // 导出 registry
export { vglobal, graphicService, graphicUtil, transformUtil, layerService } from './modules'; // 导出全局服务
export { serviceRegistry, contributionRegistry } from './common/registry'; // 导出注册表以供测试使用

export * from './register/register-arc';
export * from './register/register-arc3d';
export * from './register/register-area';
export * from './register/register-circle';
export * from './register/register-glyph';
export * from './register/register-group';
export * from './register/register-image';
export * from './register/register-line';
export * from './register/register-path';
export * from './register/register-polygon';
export * from './register/register-star';
export * from './register/register-pyramid3d';
export * from './register/register-rect';
export * from './register/register-rect3d';
export * from './register/register-richtext';
export * from './register/register-symbol';
export * from './register/register-text';
export * from './register/register-shadowRoot';
export * from './register/register-wraptext';

// plugin
export * from './plugins/builtin-plugin/html-attribute-plugin';
export * from './plugins/builtin-plugin/react-attribute-plugin';
export * from './plugins/builtin-plugin/3dview-transform-plugin';
export * from './plugins/builtin-plugin/flex-layout-plugin';

export * from './plugins/builtin-plugin/edit-module';
