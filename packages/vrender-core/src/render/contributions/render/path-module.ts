import { bindContributionProvider, createContributionProvider } from '../../../common/contribution-provider';
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
  bind(DefaultCanvasPathRender)
    .toDynamicValue(
      ({ container }: { container: any }) =>
        new DefaultCanvasPathRender(createContributionProvider(PathRenderContribution, container))
    )
    .inSingletonScope();
  bind(PathRender).toService(DefaultCanvasPathRender);
  bind(GraphicRender).toService(PathRender);
  bind(PathRenderContribution).toService(DefaultBaseInteractiveRenderContribution);

  // path 渲染器注入contributions
  bindContributionProvider(bind, PathRenderContribution);
}

export const pathModule = bindPathRenderModule;
