import { bindContributionProvider } from '../../../common/contribution-provider';
import { isBindingContextLoaded } from '../../../common/module-guard';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { PathRenderContribution } from './contributions/constants';
import { DefaultCanvasPathRender } from './path-render';
import { GraphicRender, PathRender } from './symbol';

const loadedPathModuleContexts = new WeakSet<object>();
export function bindPathRenderModule({ bind }: { bind: any }) {
  if (isBindingContextLoaded(loadedPathModuleContexts, bind)) {
    return;
  }
  // path 渲染器
  bind(DefaultCanvasPathRender).toSelf().inSingletonScope();
  bind(PathRender).to(DefaultCanvasPathRender).inSingletonScope();
  bind(GraphicRender).toService(PathRender);
  bind(PathRenderContribution).toService(DefaultBaseInteractiveRenderContribution);

  // path 渲染器注入contributions
  bindContributionProvider(bind, PathRenderContribution);
}

export const pathModule = bindPathRenderModule;
