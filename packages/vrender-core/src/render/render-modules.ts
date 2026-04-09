import { DefaultRenderService } from './render-service';
import { RenderService } from './constants';

export function bindRenderServiceModule({ bind }: { bind: any }) {
  bind(RenderService).to(DefaultRenderService);
}

export default bindRenderServiceModule;
