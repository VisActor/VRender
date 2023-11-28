import { bindContributionProvider } from '../../../common/contribution-provider';
import { ContainerModule } from '../../../common/inversify';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { ImageRenderContribution } from './contributions/constants';
import { DefaultCanvasImageRender } from './image-render';
import { GraphicRender, ImageRender } from './symbol';

let loadImageModule = false;
export const imageModule = new ContainerModule(bind => {
  if (loadImageModule) {
    return;
  }
  loadImageModule = true;
  // image渲染器
  bind(ImageRender).to(DefaultCanvasImageRender).inSingletonScope();
  bind(GraphicRender).toService(ImageRender);
  bind(ImageRenderContribution).toService(DefaultBaseInteractiveRenderContribution);
  // image 渲染器注入contributions
  bindContributionProvider(bind, ImageRenderContribution);
});
