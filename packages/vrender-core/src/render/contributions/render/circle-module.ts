import { bindContributionProvider, createContributionProvider } from '../../../common/contribution-provider';
import { isBindingContextLoaded } from '../../../common/module-guard';
import { DefaultCanvasCircleRender } from './circle-render';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { CircleRenderContribution } from './contributions/constants';
import { CircleRender, GraphicRender } from './symbol';

const loadedCircleModuleContexts = new WeakSet<object>();
export function bindCircleRenderModule({ bind }: { bind: any }) {
  if (isBindingContextLoaded(loadedCircleModuleContexts, bind)) {
    return;
  }
  // circle 渲染器
  bind(DefaultCanvasCircleRender)
    .toDynamicValue(
      ({ container }: { container: any }) =>
        new DefaultCanvasCircleRender(createContributionProvider(CircleRenderContribution, container))
    )
    .inSingletonScope();
  bind(CircleRender).toService(DefaultCanvasCircleRender);
  bind(GraphicRender).toService(CircleRender);
  bind(CircleRenderContribution).toService(DefaultBaseInteractiveRenderContribution);

  // circle 渲染器注入contributions
  bindContributionProvider(bind, CircleRenderContribution);
}

export const circleModule = bindCircleRenderModule;
