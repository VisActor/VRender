import { bindContributionProvider, createContributionProvider } from '../../../common/contribution-provider';
import { isBindingContextLoaded } from '../../../common/module-guard';
import { DefaultCanvasAreaRender } from './area-render';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { AreaRenderContribution } from './contributions/constants';
import { AreaRender, GraphicRender } from './symbol';

const loadedAreaModuleContexts = new WeakSet<object>();
export function bindAreaRenderModule({ bind }: { bind: any }) {
  if (isBindingContextLoaded(loadedAreaModuleContexts, bind)) {
    return;
  }
  // area渲染器
  bind(DefaultCanvasAreaRender)
    .toDynamicValue(
      ({ container }: { container: any }) =>
        new DefaultCanvasAreaRender(createContributionProvider(AreaRenderContribution, container))
    )
    .inSingletonScope();
  bind(AreaRender).toService(DefaultCanvasAreaRender);
  bind(GraphicRender).toService(AreaRender);
  bind(AreaRenderContribution).toService(DefaultBaseInteractiveRenderContribution);

  // area 渲染器注入contributions
  bindContributionProvider(bind, AreaRenderContribution);
}

export const areaModule = bindAreaRenderModule;
