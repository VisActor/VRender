import { container, isBrowserEnv, isNodeEnv } from '@visactor/vrender-core';
import { loadBrowserEnv, loadNodeEnv } from '@visactor/vrender-kits';
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
} from './register';
// 导出版本号
export const version = __VERSION__;

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
export * from '@visactor/vrender-core';
export * from '@visactor/vrender-kits';
export * from './register';
