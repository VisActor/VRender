import { ContainerModule } from '../../../common/inversify-lite';
import {
  DynamicLayerHandlerContribution,
  StaticLayerHandlerContribution,
  VirtualLayerHandlerContribution
} from '../../constants';
import { CanvasLayerHandlerContribution } from './canvas2d-contribution';
import { EmptyLayerHandlerContribution } from './empty-contribution';
import { OffscreenLayerHandlerContribution } from './offscreen2d-contribution';

export default new ContainerModule(bind => {
  bind(CanvasLayerHandlerContribution).toSelf();
  bind(OffscreenLayerHandlerContribution).toSelf();
  bind(EmptyLayerHandlerContribution).toSelf();
  bind(StaticLayerHandlerContribution).toService(CanvasLayerHandlerContribution);
  bind(DynamicLayerHandlerContribution).toService(OffscreenLayerHandlerContribution);
  bind(VirtualLayerHandlerContribution).toService(EmptyLayerHandlerContribution);
  // try {
  //   if (typeof OffscreenCanvas === 'function') {
  //     bind(LayerHandlerContribution).toService(OffscreenLayerHandlerContribution);
  //   }
  // } catch (err) {
  //   bind(LayerHandlerContribution).toService(CanvasLayerHandlerContribution);
  // }
});
