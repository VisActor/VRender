import { ContainerModule } from '../../../common/inversify';
import { DefaultCanvasGlyphRender } from './glyph-render';
import { GlyphRender, GraphicRender } from './symbol';

let loadGlyphModule = false;
export const glyphModule = new ContainerModule(bind => {
  if (loadGlyphModule) {
    return;
  }
  loadGlyphModule = true;
  // glyph渲染器
  bind(GlyphRender).to(DefaultCanvasGlyphRender).inSingletonScope();
  bind(GraphicRender).toService(GlyphRender);
});
