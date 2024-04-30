import { ContainerModule } from '../common/inversify-lite';
import { DefaultRenderService, RenderService } from './render-service';

export default new ContainerModule(bind => {
  bind(RenderService).to(DefaultRenderService);
});
