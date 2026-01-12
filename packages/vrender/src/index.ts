import '@visactor/vrender-core';
import {
  isBrowserEnv,
  isNodeEnv,
  registerFlexLayoutPlugin,
  registerViewTransform3dPlugin,
  registerHtmlAttributePlugin,
  registerReactAttributePlugin,
  registerDirectionalLight,
  registerOrthoCamera
} from '@visactor/vrender-core';
import { registerStar, registerBrowserEnvRegistry, registerNodeEnvRegistry } from '@visactor/vrender-kits';
import {
  registerArc,
  registerArc3d,
  registerArea,
  registerCircle,
  registerGlyph,
  registerGroup,
  registerImage,
  registerLine,
  registerPath,
  registerPolygon,
  registerPyramid3d,
  registerRect,
  registerRect3d,
  registerRichtext,
  registerShadowRoot,
  registerSymbol,
  registerText,
  registerWrapText
} from '@visactor/vrender-kits';
import { registerCustomAnimate, registerAnimate } from '@visactor/vrender-animate';
// 导出版本号
export const version = __VERSION__;

// Core is initialized via side-effects and per-package register functions

// Registry-based registration only (drop legacy ContainerModule loaders)
if (isBrowserEnv()) {
  registerBrowserEnvRegistry();
} else if (isNodeEnv()) {
  registerNodeEnvRegistry();
}

registerArc();
registerArc3d();
registerArea();
registerCircle();
registerGlyph();
registerGroup();
registerImage();
registerLine();
registerPath();
registerPolygon();
registerPyramid3d();
registerRect();
registerRect3d();
registerRichtext();
registerShadowRoot();
registerSymbol();
registerText();
registerWrapText();
registerStar();

registerFlexLayoutPlugin();
registerViewTransform3dPlugin();
registerHtmlAttributePlugin();
registerReactAttributePlugin();
registerDirectionalLight();
registerOrthoCamera();

registerCustomAnimate();
registerAnimate();

export * from '@visactor/vrender-core';
export * from '@visactor/vrender-kits';
export * from '@visactor/vrender-animate';
export * from '@visactor/vrender-components';

// avoid naming conflicts with 'State' & 'Direction' in '@visactor/vrender-components'
export { State } from '@visactor/vrender-animate';
export { Direction } from '@visactor/vrender-core';
