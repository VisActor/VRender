import {
  registerDirectionalLight,
  registerOrthoCamera,
  registerViewTransform3dPlugin
} from '@visactor/vrender-core/plugin/3d';
import { registerHtmlAttributePlugin, registerReactAttributePlugin } from '@visactor/vrender-core/plugin/attribute';
import { registerFlexLayoutPlugin } from '@visactor/vrender-core/plugin/flex-layout';
import { registerArc } from '@visactor/vrender-kits/register/register-arc';
import { registerArc3d } from '@visactor/vrender-kits/register/register-arc3d';
import { registerArea } from '@visactor/vrender-kits/register/register-area';
import { registerCircle } from '@visactor/vrender-kits/register/register-circle';
import { registerGlyph } from '@visactor/vrender-kits/register/register-glyph';
import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerImage } from '@visactor/vrender-kits/register/register-image';
import { registerLine } from '@visactor/vrender-kits/register/register-line';
import { registerPath } from '@visactor/vrender-kits/register/register-path';
import { registerPolygon } from '@visactor/vrender-kits/register/register-polygon';
import { registerPyramid3d } from '@visactor/vrender-kits/register/register-pyramid3d';
import { registerRect } from '@visactor/vrender-kits/register/register-rect';
import { registerRect3d } from '@visactor/vrender-kits/register/register-rect3d';
import { registerRichtext } from '@visactor/vrender-kits/register/register-richtext';
import { registerShadowRoot } from '@visactor/vrender-kits/register/register-shadowRoot';
import { registerStar } from '@visactor/vrender-kits/register/register-star';
import { registerSymbol } from '@visactor/vrender-kits/register/register-symbol';
import { registerText } from '@visactor/vrender-kits/register/register-text';
import { registerWrapText } from '@visactor/vrender-kits/register/register-wraptext';
import { registerAnimate } from '@visactor/vrender-animate/register';

export {
  BOOTSTRAP_STATE,
  ensureBootstrap,
  syncLegacyPickersToApp,
  syncLegacyRenderersToApp,
  type TBootstrapTarget
} from './bootstrap-utils';

const pluginRegistrations = [
  registerFlexLayoutPlugin,
  registerViewTransform3dPlugin,
  registerHtmlAttributePlugin,
  registerReactAttributePlugin,
  registerDirectionalLight,
  registerOrthoCamera
];

const standardLegacyGraphicRegistrations = [
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
  registerWrapText,
  registerStar
];

export function registerStandardPipeline(): void {
  pluginRegistrations.forEach(register => register());
  registerAnimate();
}

export function registerStandardLegacyGraphics(): void {
  standardLegacyGraphicRegistrations.forEach(register => register());
}
