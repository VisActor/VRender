import { bindContributionProvider } from '../../../common/contribution-provider';
import { ContainerModule } from '../../../common/inversify';
import { DefaultCanvasCircleRender } from './circle-render';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { CircleRenderContribution } from './contributions/constants';
import { CircleRender, GraphicRender } from './symbol';

let loadCircleModule = false;
export const circleModule = new ContainerModule(bind => {
  if (loadCircleModule) {
    return;
  }
  loadCircleModule = true;
  // circle 渲染器
  bind(DefaultCanvasCircleRender).toSelf().inSingletonScope();
  bind(CircleRender).to(DefaultCanvasCircleRender).inSingletonScope();
  bind(GraphicRender).toService(CircleRender);
  bind(CircleRenderContribution).toService(DefaultBaseInteractiveRenderContribution);

  // circle 渲染器注入contributions
  bindContributionProvider(bind, CircleRenderContribution);
});
