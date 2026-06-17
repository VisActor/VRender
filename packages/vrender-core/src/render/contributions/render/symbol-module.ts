import { bindContributionProvider, createContributionProvider } from '../../../common/contribution-provider';
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
  bind(DefaultCanvasSymbolRender)
    .toDynamicValue(
      ({ container }: { container: any }) =>
        new DefaultCanvasSymbolRender(createContributionProvider(SymbolRenderContribution, container))
    )
    .inSingletonScope();
  bind(SymbolRender).toService(DefaultCanvasSymbolRender);
  bind(GraphicRender).toService(SymbolRender);
  bind(SymbolRenderContribution).toService(DefaultBaseInteractiveRenderContribution);
  // symbol 渲染器注入contributions
  bindContributionProvider(bind, SymbolRenderContribution);
}

export const symbolModule = bindSymbolRenderModule;
