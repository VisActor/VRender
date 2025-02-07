import { ContainerModule, GraphicRender } from '@visactor/vrender-core';
import { DefaultCanvasLottieRender } from './lottie-render';

let loadLottieModule = false;
export const lottieModule = new ContainerModule(bind => {
  if (loadLottieModule) {
    return;
  }
  loadLottieModule = true;
  // lottie渲染器
  bind(DefaultCanvasLottieRender).toSelf().inSingletonScope();
  bind(GraphicRender).toService(DefaultCanvasLottieRender);
});
