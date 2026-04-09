import { createContributionProvider } from '../../../common/contribution-provider';
import { StarRenderContribution } from './contributions/constants';
import { DefaultCanvasStarRender } from './star-render';
import { GraphicRender, StarRender } from './symbol';

let loadStarModule = false;
export function bindStarRenderModule({ bind }: { bind: any }) {
  if (loadStarModule) {
    return;
  }
  loadStarModule = true;
  // Star renderer
  bind(DefaultCanvasStarRender)
    .toDynamicValue(
      ({ container }: { container: any }) =>
        new DefaultCanvasStarRender(createContributionProvider(StarRenderContribution, container))
    )
    .inSingletonScope();
  bind(StarRender).toService(DefaultCanvasStarRender);
  bind(GraphicRender).toService(StarRender);
}

export const starModule = bindStarRenderModule;
