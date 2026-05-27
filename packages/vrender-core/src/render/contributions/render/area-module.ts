import { bindContributionProvider } from '../../../common/contribution-provider';
import { isBindingContextLoaded } from '../../../common/module-guard';
import { DefaultCanvasAreaRender } from './area-render';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { AreaRenderContribution } from './contributions/constants';
import { DefaultIncrementalCanvasAreaRender } from './incremental-area-render';
import { AreaRender, GraphicRender } from './symbol';

const loadedAreaModuleContexts = new WeakSet<object>();
export function bindAreaRenderModule({ bind }: { bind: any }) {
  if (isBindingContextLoaded(loadedAreaModuleContexts, bind)) {
    return;
  }
  // area渲染器
  bind(DefaultCanvasAreaRender).toSelf().inSingletonScope();
  bind(AreaRender).to(DefaultCanvasAreaRender).inSingletonScope();
  bind(GraphicRender).toService(AreaRender);
  bind(AreaRenderContribution).toService(DefaultBaseInteractiveRenderContribution);

  // area 渲染器注入contributions
  bindContributionProvider(bind, AreaRenderContribution);

  // incremental-line渲染器
  bind(DefaultIncrementalCanvasAreaRender).toSelf().inSingletonScope();
}

export const areaModule = bindAreaRenderModule;
