import { ContainerModule } from 'inversify';
import { DefaultRenderService, RenderService } from './render-service';

export default new ContainerModule(bind => {
  bind(DefaultRenderService).toSelf();
  bind(RenderService).toService(DefaultRenderService);
});
