import { isBindingContextLoaded } from '../../../common/module-guard';
import { DefaultCanvasGlyphRender } from './glyph-render';
import { GlyphRender, GraphicRender } from './symbol';

const loadedGlyphModuleContexts = new WeakSet<object>();
export function bindGlyphRenderModule({ bind }: { bind: any }) {
  if (isBindingContextLoaded(loadedGlyphModuleContexts, bind)) {
    return;
  }
  // glyph渲染器
  bind(GlyphRender).to(DefaultCanvasGlyphRender).inSingletonScope();
  bind(GraphicRender).toService(GlyphRender);
}

export const glyphModule = bindGlyphRenderModule;
