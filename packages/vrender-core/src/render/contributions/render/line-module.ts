import { isBindingContextLoaded } from '../../../common/module-guard';
import { DefaultIncrementalCanvasLineRender } from './incremental-line-render';
import { DefaultCanvasLineRender } from './line-render';
import { GraphicRender, LineRender } from './symbol';

const loadedLineModuleContexts = new WeakSet<object>();
export function bindLineRenderModule({ bind }: { bind: any }) {
  if (isBindingContextLoaded(loadedLineModuleContexts, bind)) {
    return;
  }
  // line渲染器
  bind(DefaultCanvasLineRender).toSelf().inSingletonScope();
  bind(DefaultIncrementalCanvasLineRender).toSelf().inSingletonScope();
  bind(LineRender).to(DefaultCanvasLineRender).inSingletonScope();
  bind(GraphicRender).toService(LineRender);
}

export const lineModule = bindLineRenderModule;
