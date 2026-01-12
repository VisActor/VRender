import { serviceRegistry, contributionRegistry, GraphicRender } from '@visactor/vrender-core';
import { DefaultCanvasLottieRender } from './lottie-render';

let _registered = false;
export function registerCanvasLottieRender() {
  if (_registered) {
    return;
  }
  _registered = true;
  const render = new DefaultCanvasLottieRender();
  serviceRegistry.registerSingleton(GraphicRender, render);
  contributionRegistry.register(GraphicRender, render);
}
