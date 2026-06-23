import { initBrowserEnv } from '../../src/env/browser';
import { registerArc } from '../../src/register/register-arc';
import { registerArc3d } from '../../src/register/register-arc3d';
import { registerArea } from '../../src/register/register-area';
import { registerCircle } from '../../src/register/register-circle';
import { registerGlyph } from '../../src/register/register-glyph';
import { registerGroup } from '../../src/register/register-group';
import { registerImage } from '../../src/register/register-image';
import { registerLine } from '../../src/register/register-line';
import { registerPath } from '../../src/register/register-path';
import { registerPolygon } from '../../src/register/register-polygon';
import { registerPyramid3d } from '../../src/register/register-pyramid3d';
import { registerRect } from '../../src/register/register-rect';
import { registerRect3d } from '../../src/register/register-rect3d';
import { registerRichtext } from '../../src/register/register-richtext';
import { registerShadowRoot } from '../../src/register/register-shadowRoot';
import { registerSymbol } from '../../src/register/register-symbol';
import { registerText } from '../../src/register/register-text';
import { registerStar } from '../../src/register/register-star';
import { registerWrapText } from '../../src/register/register-wraptext';
import { registerGifImage } from '../../src/register/register-gif';

initBrowserEnv();

describe('vrender-kits register modules', () => {
  test('register fns are callable and idempotent', () => {
    const fns = [
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
      registerStar,
      registerWrapText,
      registerGifImage
    ];

    fns.forEach(fn => {
      expect(() => fn()).not.toThrow();
      expect(() => fn()).not.toThrow();
    });
  });
});
