import { GraphicRender, ImageRenderContribution } from '@visactor/vrender-core';
import { createContributionProvider } from '../../../common/explicit-binding';
import { DefaultCanvasGifImageRender } from './gif-image-render';

let loadGifImageModule = false;
export function bindGifImageRenderContribution(container: any) {
  if (loadGifImageModule) {
    return;
  }
  loadGifImageModule = true;
  // gifImage渲染器
  container
    .bind(DefaultCanvasGifImageRender)
    .toDynamicValue(
      () => new DefaultCanvasGifImageRender(createContributionProvider(ImageRenderContribution, container))
    )
    .inSingletonScope();
  container.bind(GraphicRender).toService(DefaultCanvasGifImageRender);
}
