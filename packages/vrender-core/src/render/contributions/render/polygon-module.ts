import { bindContributionProvider, createContributionProvider } from '../../../common/contribution-provider';
import { isBindingContextLoaded } from '../../../common/module-guard';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { PolygonRenderContribution } from './contributions/constants';
import { DefaultCanvasPolygonRender } from './polygon-render';
import { GraphicRender, PolygonRender } from './symbol';

const loadedPolygonModuleContexts = new WeakSet<object>();
export function bindPolygonRenderModule({ bind }: { bind: any }) {
  if (isBindingContextLoaded(loadedPolygonModuleContexts, bind)) {
    return;
  }
  // polygon渲染器
  bind(PolygonRender)
    .toDynamicValue(
      ({ container }: { container: any }) =>
        new DefaultCanvasPolygonRender(createContributionProvider(PolygonRenderContribution, container))
    )
    .inSingletonScope();
  bind(GraphicRender).toService(PolygonRender);
  bind(PolygonRenderContribution).toService(DefaultBaseInteractiveRenderContribution);

  // polygon 渲染器注入contributions
  bindContributionProvider(bind, PolygonRenderContribution);
}

export const polygonModule = bindPolygonRenderModule;
