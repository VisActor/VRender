import { bindContributionProvider } from '../../../common/contribution-provider';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { ImageRenderContribution } from './contributions/constants';
import { DefaultCanvasImageRender } from './image-render';
import { GraphicRender, ImageRender } from './symbol';

let loadImageModule = false;
export function bindImageRenderModule({ bind }: { bind: any }) {
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
}

export const imageModule = bindImageRenderModule;
