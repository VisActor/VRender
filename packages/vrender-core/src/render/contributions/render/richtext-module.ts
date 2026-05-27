import { isBindingContextLoaded } from '../../../common/module-guard';
import { DefaultCanvasRichTextRender } from './richtext-render';
import { GraphicRender, RichTextRender } from './symbol';

const loadedRichtextModuleContexts = new WeakSet<object>();
export function bindRichtextRenderModule({ bind }: { bind: any }) {
  if (isBindingContextLoaded(loadedRichtextModuleContexts, bind)) {
    return;
  }
  // richtext渲染器
  bind(RichTextRender).to(DefaultCanvasRichTextRender).inSingletonScope();
  bind(GraphicRender).toService(RichTextRender);
}

export const richtextModule = bindRichtextRenderModule;
