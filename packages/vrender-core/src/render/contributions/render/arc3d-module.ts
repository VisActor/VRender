import { ContainerModule } from '../../../common/inversify';
import { DefaultCanvasArcRender } from './arc-render';
import { DefaultCanvasArc3DRender } from './arc3d-render';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { ArcRenderContribution } from './contributions/constants';
import { Arc3dRender, ArcRender, GraphicRender } from './symbol';

let loadArc3dModule = false;
export const arc3dModule = new ContainerModule(bind => {
  if (loadArc3dModule) {
    return;
  }
  loadArc3dModule = true;
  // arc3d 渲染器
  bind(Arc3dRender).to(DefaultCanvasArc3DRender).inSingletonScope();
  bind(GraphicRender).toService(Arc3dRender);
});
