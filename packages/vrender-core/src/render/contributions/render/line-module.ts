import { DefaultIncrementalCanvasLineRender } from './incremental-line-render';
import { DefaultCanvasLineRender } from './line-render';
import { GraphicRender, LineRender } from './symbol';

let loadLineModule = false;
export function bindLineRenderModule({ bind }: { bind: any }) {
  if (loadLineModule) {
    return;
  }
  loadLineModule = true;
  // line渲染器
  bind(DefaultCanvasLineRender).toSelf().inSingletonScope();
  bind(DefaultIncrementalCanvasLineRender).toSelf().inSingletonScope();
  bind(LineRender).to(DefaultCanvasLineRender).inSingletonScope();
  bind(GraphicRender).toService(LineRender);
}

export const lineModule = bindLineRenderModule;
