import { ContainerModule, GraphicRender } from '@visactor/vrender-core';
import { DefaultCanvasGifImageRender } from './gif-image-render';

let loadGifImageModule = false;
export const gifImageModule = new ContainerModule(bind => {
  if (loadGifImageModule) {
    return;
  }
  loadGifImageModule = true;
  // gifImage渲染器
  bind(DefaultCanvasGifImageRender).toSelf().inSingletonScope();
  bind(GraphicRender).toService(DefaultCanvasGifImageRender);
});
