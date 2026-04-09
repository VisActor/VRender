import { DefaultCanvasRichTextRender } from './richtext-render';
import { GraphicRender, RichTextRender } from './symbol';

let loadRichtextModule = false;
export function bindRichtextRenderModule({ bind }: { bind: any }) {
  if (loadRichtextModule) {
    return;
  }
  loadRichtextModule = true;
  // richtext渲染器
  bind(RichTextRender).to(DefaultCanvasRichTextRender).inSingletonScope();
  bind(GraphicRender).toService(RichTextRender);
}

export const richtextModule = bindRichtextRenderModule;
