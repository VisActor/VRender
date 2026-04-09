import { DefaultCanvasRect3dRender } from './rect3d-render';
import { GraphicRender, Rect3DRender } from './symbol';

let loadRect3dModule = false;
export function bindRect3dRenderModule({ bind }: { bind: any }) {
  if (loadRect3dModule) {
    return;
  }
  loadRect3dModule = true;
  // rect3d 渲染器
  bind(Rect3DRender).to(DefaultCanvasRect3dRender).inSingletonScope();
  bind(GraphicRender).toService(Rect3DRender);
}

export const rect3dModule = bindRect3dRenderModule;
