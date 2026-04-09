import { bindContributionProvider } from '../../../common/contribution-provider';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { PathRenderContribution } from './contributions/constants';
import { DefaultCanvasPathRender } from './path-render';
import { GraphicRender, PathRender } from './symbol';

let loadPathModule = false;
export function bindPathRenderModule({ bind }: { bind: any }) {
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
}

export const pathModule = bindPathRenderModule;
