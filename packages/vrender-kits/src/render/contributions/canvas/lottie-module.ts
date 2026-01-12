import { application, GraphicRender } from '@visactor/vrender-core';
import { DefaultCanvasLottieRender } from './lottie-render';

let _registered = false;
export function registerCanvasLottieRender() {
  if (_registered) {
    return;
  }
  _registered = true;
  const render = new DefaultCanvasLottieRender();
  application.services.registerSingleton(GraphicRender, render);
  application.contributions.register(GraphicRender, render);
}
