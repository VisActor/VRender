import { DefaultCanvasPyramid3dRender } from './pyramid3d-render';
import { GraphicRender, Pyramid3dRender, Rect3DRender } from './symbol';

let loadPyramid3dModule = false;
export function bindPyramid3dRenderModule({ bind }: { bind: any }) {
  if (loadPyramid3dModule) {
    return;
  }
  loadPyramid3dModule = true;
  // pyramid3d 渲染器
  bind(Pyramid3dRender).to(DefaultCanvasPyramid3dRender).inSingletonScope();
  bind(GraphicRender).toService(Pyramid3dRender);
}

export const pyramid3dModule = bindPyramid3dRenderModule;
