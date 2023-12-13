import { bindContributionProvider } from '../../../common/contribution-provider';
import { ContainerModule } from '../../../common/inversify';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { PathRenderContribution } from './contributions/constants';
import { DefaultCanvasPathRender } from './path-render';
import { GraphicRender, PathRender } from './symbol';

let loadPathModule = false;
export const pathModule = new ContainerModule(bind => {
  if (loadPathModule) {
    return;
  }
  loadPathModule = true;
  // path 渲染器
  bind(DefaultCanvasPathRender).toSelf().inSingletonScope();
  bind(PathRender).to(DefaultCanvasPathRender).inSingletonScope();
  bind(GraphicRender).toService(PathRender);
  bind(PathRenderContribution).toService(DefaultBaseInteractiveRenderContribution);

  // path 渲染器注入contributions
  bindContributionProvider(bind, PathRenderContribution);
});
