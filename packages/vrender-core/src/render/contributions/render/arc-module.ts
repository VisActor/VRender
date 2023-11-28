import { bindContributionProvider } from '../../../common/contribution-provider';
import { ContainerModule } from '../../../common/inversify';
import { DefaultCanvasArcRender } from './arc-render';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { ArcRenderContribution } from './contributions/constants';
import { ArcRender, GraphicRender } from './symbol';

let loadArcModule = false;
export const arcModule = new ContainerModule(bind => {
  if (loadArcModule) {
    return;
  }
  loadArcModule = true;
  // arc 渲染器
  bind(DefaultCanvasArcRender).toSelf().inSingletonScope();
  bind(ArcRender).to(DefaultCanvasArcRender).inSingletonScope();
  bind(GraphicRender).toService(ArcRender);
  bind(ArcRenderContribution).toService(DefaultBaseInteractiveRenderContribution);
  // arc 渲染器注入contributions
  bindContributionProvider(bind, ArcRenderContribution);
});
