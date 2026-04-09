import { GraphicRender, RectRenderContribution } from '@visactor/vrender-core';
import { createContributionProvider } from '../../../common/explicit-binding';
import { DefaultCanvasLottieRender } from './lottie-render';

let loadLottieModule = false;
export function bindLottieRenderContribution(container: any) {
  if (loadLottieModule) {
    return;
  }
  loadLottieModule = true;
  // lottie渲染器
  container
    .bind(DefaultCanvasLottieRender)
    .toDynamicValue(() => new DefaultCanvasLottieRender(createContributionProvider(RectRenderContribution, container)))
    .inSingletonScope();
  container.bind(GraphicRender).toService(DefaultCanvasLottieRender);
}
