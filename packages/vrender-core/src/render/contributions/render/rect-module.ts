import { bindContributionProvider, createContributionProvider } from '../../../common/contribution-provider';
import { isBindingContextLoaded } from '../../../common/module-guard';
import {
  DefaultBaseInteractiveRenderContribution,
  SplitRectAfterRenderContribution,
  SplitRectBeforeRenderContribution
} from './contributions';
import { RectRenderContribution } from './contributions/constants';
import { DefaultCanvasRectRender } from './rect-render';
import { GraphicRender, RectRender } from './symbol';

const loadedRectModuleContexts = new WeakSet<object>();
export function bindRectRenderModule({ bind }: { bind: any }) {
  if (isBindingContextLoaded(loadedRectModuleContexts, bind)) {
    return;
  }
  // rect 渲染器
  bind(DefaultCanvasRectRender)
    .toDynamicValue(
      ({ container }: { container: any }) =>
        new DefaultCanvasRectRender(createContributionProvider(RectRenderContribution, container))
    )
    .inSingletonScope();
  bind(RectRender).toService(DefaultCanvasRectRender);
  bind(GraphicRender).toService(RectRender);
  bind(SplitRectAfterRenderContribution).toSelf();
  bind(SplitRectBeforeRenderContribution).toSelf();
  bind(RectRenderContribution).toService(SplitRectAfterRenderContribution);
  bind(RectRenderContribution).toService(SplitRectBeforeRenderContribution);
  bind(RectRenderContribution).toService(DefaultBaseInteractiveRenderContribution);
  // rect 渲染器注入contributions
  bindContributionProvider(bind, RectRenderContribution);
}

export const rectModule = bindRectRenderModule;
