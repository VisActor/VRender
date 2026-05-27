import { bindContributionProvider } from '../../../common/contribution-provider';
import { isBindingContextLoaded } from '../../../common/module-guard';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { SymbolRenderContribution } from './contributions/constants';
import { GraphicRender, SymbolRender } from './symbol';
import { DefaultCanvasSymbolRender } from './symbol-render';

const loadedSymbolModuleContexts = new WeakSet<object>();
export function bindSymbolRenderModule({ bind }: { bind: any }) {
  if (isBindingContextLoaded(loadedSymbolModuleContexts, bind)) {
    return;
  }
  // symbol渲染器
  bind(DefaultCanvasSymbolRender).toSelf().inSingletonScope();
  bind(SymbolRender).to(DefaultCanvasSymbolRender).inSingletonScope();
  bind(GraphicRender).toService(SymbolRender);
  bind(SymbolRenderContribution).toService(DefaultBaseInteractiveRenderContribution);
  // symbol 渲染器注入contributions
  bindContributionProvider(bind, SymbolRenderContribution);
}

export const symbolModule = bindSymbolRenderModule;
