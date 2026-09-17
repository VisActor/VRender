import { bindContributionProvider, createContributionProvider } from '../../../common/contribution-provider';
import { isBindingContextLoaded } from '../../../common/module-guard';
import { LineRenderContribution } from './contributions/constants';
import { DefaultCanvasLineRender } from './line-render';
import { GraphicRender, LineRender } from './symbol';

const loadedLineModuleContexts = new WeakSet<object>();
export function bindLineRenderModule({ bind }: { bind: any }) {
  if (isBindingContextLoaded(loadedLineModuleContexts, bind)) {
    return;
  }
  // line渲染器
  bind(DefaultCanvasLineRender)
    .toDynamicValue(
      ({ container }: { container: any }) =>
        new DefaultCanvasLineRender(createContributionProvider(LineRenderContribution, container))
    )
    .inSingletonScope();
  bind(LineRender).toService(DefaultCanvasLineRender);
  bind(GraphicRender).toService(LineRender);
  // line渲染器注入contributions
  bindContributionProvider(bind, LineRenderContribution);
}

export const lineModule = bindLineRenderModule;
