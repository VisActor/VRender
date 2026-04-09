import { DefaultCanvasGlyphRender } from './glyph-render';
import { GlyphRender, GraphicRender } from './symbol';

let loadGlyphModule = false;
export function bindGlyphRenderModule({ bind }: { bind: any }) {
  if (loadGlyphModule) {
    return;
  }
  loadGlyphModule = true;
  // glyph渲染器
  bind(GlyphRender).to(DefaultCanvasGlyphRender).inSingletonScope();
  bind(GraphicRender).toService(GlyphRender);
}

export const glyphModule = bindGlyphRenderModule;
