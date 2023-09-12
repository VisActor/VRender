import { ContainerModule } from '../../../common/inversify-lite';
import { LayerHandlerContribution } from '../../layer';
import { CanvasLayerHandlerContribution } from './canvas2d-contribution';
import { OffscreenLayerHandlerContribution } from './offscreen2d-contribution';

export default new ContainerModule(bind => {
  bind(CanvasLayerHandlerContribution).toSelf();
  bind(OffscreenLayerHandlerContribution).toSelf();
  bind(LayerHandlerContribution).toService(CanvasLayerHandlerContribution);
  // try {
  //   if (typeof OffscreenCanvas === 'function') {
  //     bind(LayerHandlerContribution).toService(OffscreenLayerHandlerContribution);
  //   }
  // } catch (err) {
  //   bind(LayerHandlerContribution).toService(CanvasLayerHandlerContribution);
  // }
});
