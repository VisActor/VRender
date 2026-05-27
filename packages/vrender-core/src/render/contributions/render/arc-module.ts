import { bindContributionProvider } from '../../../common/contribution-provider';
import { isBindingContextLoaded } from '../../../common/module-guard';
import { DefaultCanvasArcRender } from './arc-render';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { ArcRenderContribution } from './contributions/constants';
import { ArcRender, GraphicRender } from './symbol';

const loadedArcModuleContexts = new WeakSet<object>();
export function bindArcRenderModule({ bind }: { bind: any }) {
  if (isBindingContextLoaded(loadedArcModuleContexts, bind)) {
    return;
  }
  // arc 渲染器
  bind(DefaultCanvasArcRender).toSelf().inSingletonScope();
  bind(ArcRender).to(DefaultCanvasArcRender).inSingletonScope();
  bind(GraphicRender).toService(ArcRender);
  bind(ArcRenderContribution).toService(DefaultBaseInteractiveRenderContribution);
  // arc 渲染器注入contributions
  bindContributionProvider(bind, ArcRenderContribution);
}

export const arcModule = bindArcRenderModule;
