import { ContainerModule } from '../../../common/inversify';
import { DefaultCanvasStarRender } from './star-render';
import { GraphicRender, StarRender } from './symbol';

let loadStarModule = false;
export const starModule = new ContainerModule(bind => {
  if (loadStarModule) {
    return;
  }
  loadStarModule = true;
  // Star renderer
  bind(StarRender).to(DefaultCanvasStarRender).inSingletonScope();
  bind(GraphicRender).toService(StarRender);
});
