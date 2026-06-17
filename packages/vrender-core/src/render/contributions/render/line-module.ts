import { isBindingContextLoaded } from '../../../common/module-guard';
import { DefaultCanvasLineRender } from './line-render';
import { GraphicRender, LineRender } from './symbol';

const loadedLineModuleContexts = new WeakSet<object>();
export function bindLineRenderModule({ bind }: { bind: any }) {
  if (isBindingContextLoaded(loadedLineModuleContexts, bind)) {
    return;
  }
  // line渲染器
  bind(DefaultCanvasLineRender)
    .toDynamicValue(() => new DefaultCanvasLineRender())
    .inSingletonScope();
  bind(LineRender).toService(DefaultCanvasLineRender);
  bind(GraphicRender).toService(LineRender);
}

export const lineModule = bindLineRenderModule;
