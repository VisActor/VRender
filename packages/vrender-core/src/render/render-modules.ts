import { ContainerModule } from '../common/inversify-lite';
import { DefaultRenderService } from './render-service';
import { RenderService } from './constants';

export default new ContainerModule(bind => {
  bind(RenderService).to(DefaultRenderService);
});
