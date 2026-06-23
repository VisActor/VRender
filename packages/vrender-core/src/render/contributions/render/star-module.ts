import { bindContributionProvider, createContributionProvider } from '../../../common/contribution-provider';
import { isBindingContextLoaded } from '../../../common/module-guard';
import { StarRenderContribution } from './contributions/constants';
import { DefaultCanvasStarRender } from './star-render';
import { GraphicRender, StarRender } from './symbol';

const loadedStarModuleContexts = new WeakSet<object>();
export function bindStarRenderModule({ bind }: { bind: any }) {
  if (isBindingContextLoaded(loadedStarModuleContexts, bind)) {
    return;
  }
  // Star renderer
  bind(DefaultCanvasStarRender)
    .toDynamicValue(
      ({ container }: { container: any }) =>
        new DefaultCanvasStarRender(createContributionProvider(StarRenderContribution, container))
    )
    .inSingletonScope();
  bind(StarRender).toService(DefaultCanvasStarRender);
  bind(GraphicRender).toService(StarRender);
  bindContributionProvider(bind, StarRenderContribution);
}

export const starModule = bindStarRenderModule;
