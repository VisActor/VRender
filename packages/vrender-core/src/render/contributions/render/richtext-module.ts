import { ContainerModule } from '../../../common/inversify';
import { DefaultCanvasRichTextRender } from './richtext-render';
import { GraphicRender, RichTextRender } from './symbol';

let loadRichtextModule = false;
export const richtextModule = new ContainerModule(bind => {
  if (loadRichtextModule) {
    return;
  }
  loadRichtextModule = true;
  // richtext渲染器
  bind(RichTextRender).to(DefaultCanvasRichTextRender).inSingletonScope();
  bind(GraphicRender).toService(RichTextRender);
});
