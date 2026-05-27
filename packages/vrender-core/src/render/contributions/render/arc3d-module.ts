import { isBindingContextLoaded } from '../../../common/module-guard';
import { DefaultCanvasArc3DRender } from './arc3d-render';
import { Arc3dRender, GraphicRender } from './symbol';

const loadedArc3dModuleContexts = new WeakSet<object>();
export function bindArc3dRenderModule({ bind }: { bind: any }) {
  if (isBindingContextLoaded(loadedArc3dModuleContexts, bind)) {
    return;
  }
  // arc3d 渲染器
  bind(Arc3dRender).to(DefaultCanvasArc3DRender).inSingletonScope();
  bind(GraphicRender).toService(Arc3dRender);
}

export const arc3dModule = bindArc3dRenderModule;
