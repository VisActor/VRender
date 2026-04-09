import { bindContributionProvider } from '../../../common/contribution-provider';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { SymbolRenderContribution } from './contributions/constants';
import { GraphicRender, SymbolRender } from './symbol';
import { DefaultCanvasSymbolRender } from './symbol-render';

let loadSymbolModule = false;
export function bindSymbolRenderModule({ bind }: { bind: any }) {
  if (loadSymbolModule) {
    return;
  }
  loadSymbolModule = true;
  // symbol渲染器
  bind(DefaultCanvasSymbolRender).toSelf().inSingletonScope();
  bind(SymbolRender).to(DefaultCanvasSymbolRender).inSingletonScope();
  bind(GraphicRender).toService(SymbolRender);
  bind(SymbolRenderContribution).toService(DefaultBaseInteractiveRenderContribution);
  // symbol 渲染器注入contributions
  bindContributionProvider(bind, SymbolRenderContribution);
}

export const symbolModule = bindSymbolRenderModule;
