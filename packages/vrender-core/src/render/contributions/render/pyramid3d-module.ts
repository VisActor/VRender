import { ContainerModule } from '../../../common/inversify';
import { DefaultCanvasPyramid3dRender } from './pyramid3d-render';
import { GraphicRender, Pyramid3dRender, Rect3DRender } from './symbol';

let loadPyramid3dModule = false;
export const pyramid3dModule = new ContainerModule(bind => {
  if (loadPyramid3dModule) {
    return;
  }
  loadPyramid3dModule = true;
  // pyramid3d 渲染器
  bind(Pyramid3dRender).to(DefaultCanvasPyramid3dRender).inSingletonScope();
  bind(GraphicRender).toService(Pyramid3dRender);
});
