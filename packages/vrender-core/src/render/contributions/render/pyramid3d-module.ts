import { isBindingContextLoaded } from '../../../common/module-guard';
import { DefaultCanvasPyramid3dRender } from './pyramid3d-render';
import { GraphicRender, Pyramid3dRender } from './symbol';

const loadedPyramid3dModuleContexts = new WeakSet<object>();
export function bindPyramid3dRenderModule({ bind }: { bind: any }) {
  if (isBindingContextLoaded(loadedPyramid3dModuleContexts, bind)) {
    return;
  }
  // pyramid3d 渲染器
  bind(DefaultCanvasPyramid3dRender)
    .toDynamicValue(() => new DefaultCanvasPyramid3dRender())
    .inSingletonScope();
  bind(Pyramid3dRender).toService(DefaultCanvasPyramid3dRender);
  bind(GraphicRender).toService(Pyramid3dRender);
}

export const pyramid3dModule = bindPyramid3dRenderModule;
