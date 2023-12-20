import { bindContributionProvider } from '../../../common/contribution-provider';
import { ContainerModule } from '../../../common/inversify';
import { DefaultCanvasArcRender } from './arc-render';
import {
  DefaultBaseInteractiveRenderContribution,
  SplitRectAfterRenderContribution,
  SplitRectBeforeRenderContribution
} from './contributions';
import { ArcRenderContribution, RectRenderContribution } from './contributions/constants';
import { DefaultCanvasRectRender } from './rect-render';
import { ArcRender, GraphicRender, RectRender } from './symbol';

let loadRectModule = false;
export const rectModule = new ContainerModule(bind => {
  if (loadRectModule) {
    return;
  }
  loadRectModule = true;
  // rect 渲染器
  bind(DefaultCanvasRectRender).toSelf().inSingletonScope();
  bind(RectRender).to(DefaultCanvasRectRender).inSingletonScope();
  bind(GraphicRender).toService(RectRender);
  bind(SplitRectAfterRenderContribution).toSelf();
  bind(SplitRectBeforeRenderContribution).toSelf();
  bind(RectRenderContribution).toService(SplitRectAfterRenderContribution);
  bind(RectRenderContribution).toService(SplitRectBeforeRenderContribution);
  bind(RectRenderContribution).toService(DefaultBaseInteractiveRenderContribution);
  // rect 渲染器注入contributions
  bindContributionProvider(bind, RectRenderContribution);
});
