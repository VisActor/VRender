import '@visactor/vrender-core';
import {
  container,
  isBrowserEnv,
  isNodeEnv,
  preLoadAllModule,
  registerFlexLayoutPlugin,
  registerViewTransform3dPlugin,
  registerHtmlAttributePlugin,
  registerReactAttributePlugin,
  registerDirectionalLight,
  registerOrthoCamera
} from '@visactor/vrender-core';
import { loadBrowserEnv, loadNodeEnv, registerStar } from '@visactor/vrender-kits';
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
// 导出版本号
export const version = __VERSION__;

preLoadAllModule();

if (isBrowserEnv()) {
  loadBrowserEnv(container);
} else if (isNodeEnv()) {
  loadNodeEnv(container);
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
export * from '@visactor/vrender-core';
export * from '@visactor/vrender-kits';
