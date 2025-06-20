// import 'core-js/proposals/reflect-metadata';
import './modules';

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
export * from './core/light';
export * from './core/camera';
export * from './picker';
export * from './resource-loader/loader';
export * from './color-string';
export * from './factory';

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
export * from './common/contribution-provider';

export { wrapCanvas, wrapContext } from './canvas/util';
export * from './common/xml';
export * from './common/inversify-lite';
export * from './constants';
export * from './application';
export * from './env-check';

export * from './render/contributions/render/arc-module';
export * from './render/contributions/render/rect-module';
export * from './render/contributions/render/line-module';
export * from './render/contributions/render/area-module';
export * from './render/contributions/render/symbol-module';
export * from './render/contributions/render/circle-module';
export * from './render/contributions/render/text-module';
export * from './render/contributions/render/path-module';
export * from './render/contributions/render/polygon-module';
export * from './render/contributions/render/star-module';
export * from './render/contributions/render/glyph-module';
export * from './render/contributions/render/richtext-module';
export * from './render/contributions/render/image-module';
export * from './render/contributions/render/rect3d-module';
export * from './render/contributions/render/arc3d-module';
export * from './render/contributions/render/pyramid3d-module';

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

// export const morphPath = {};
// export const multiToOneMorph = {};
// export const oneToMultiMorph = {};
// export class ACustomAnimate {}
// export const AnimateGroup = {};
// export const Animate = {};
// export const defaultTicker = {};
