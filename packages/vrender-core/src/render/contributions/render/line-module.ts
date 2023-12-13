import { ContainerModule } from '../../../common/inversify';
import { DefaultIncrementalCanvasLineRender } from './incremental-line-render';
import { DefaultCanvasLineRender } from './line-render';
import { GraphicRender, LineRender } from './symbol';

let loadLineModule = false;
export const lineModule = new ContainerModule(bind => {
  if (loadLineModule) {
    return;
  }
  loadLineModule = true;
  // line渲染器
  bind(DefaultCanvasLineRender).toSelf().inSingletonScope();
  bind(DefaultIncrementalCanvasLineRender).toSelf().inSingletonScope();
  bind(LineRender).to(DefaultCanvasLineRender).inSingletonScope();
  bind(GraphicRender).toService(LineRender);
});
