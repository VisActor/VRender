import { bindContributionProvider } from '../../../common/contribution-provider';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { PathRenderContribution, PolygonRenderContribution } from './contributions/constants';
import { DefaultCanvasPathRender } from './path-render';
import { DefaultCanvasPolygonRender } from './polygon-render';
import { GraphicRender, PathRender, PolygonRender } from './symbol';

let loadPolygonModule = false;
export function bindPolygonRenderModule({ bind }: { bind: any }) {
  if (loadPolygonModule) {
    return;
  }
  loadPolygonModule = true;
  // polygon渲染器
  bind(PolygonRender).to(DefaultCanvasPolygonRender).inSingletonScope();
  bind(GraphicRender).toService(PolygonRender);
  bind(PolygonRenderContribution).toService(DefaultBaseInteractiveRenderContribution);

  // polygon 渲染器注入contributions
  bindContributionProvider(bind, PolygonRenderContribution);
}

export const polygonModule = bindPolygonRenderModule;
