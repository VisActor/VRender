import { bindContributionProvider, createContributionProvider } from '../../../common/contribution-provider';
import { isBindingContextLoaded } from '../../../common/module-guard';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { ImageRenderContribution } from './contributions/constants';
import { DefaultCanvasImageRender } from './image-render';
import { GraphicRender, ImageRender } from './symbol';

const loadedImageModuleContexts = new WeakSet<object>();
export function bindImageRenderModule({ bind }: { bind: any }) {
  if (isBindingContextLoaded(loadedImageModuleContexts, bind)) {
    return;
  }
  // image渲染器
  bind(ImageRender)
    .toDynamicValue(
      ({ container }: { container: any }) =>
        new DefaultCanvasImageRender(createContributionProvider(ImageRenderContribution, container))
    )
    .inSingletonScope();
  bind(GraphicRender).toService(ImageRender);
  bind(ImageRenderContribution).toService(DefaultBaseInteractiveRenderContribution);
  // image 渲染器注入contributions
  bindContributionProvider(bind, ImageRenderContribution);
}

export const imageModule = bindImageRenderModule;
