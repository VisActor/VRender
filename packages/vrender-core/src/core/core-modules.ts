import { ContainerModule } from '../common/inversify-lite';
import { DefaultGlobal } from './global';
import { DefaultGraphicUtil, DefaultTransformUtil } from './graphic-utils';
import { DefaultLayerService } from './layer-service';
import { DefaultWindow, VWindow } from './window';
import { GraphicUtil, LayerService, TransformUtil } from './constants';
import { VGlobal } from '../constants';

export default new ContainerModule(bind => {
  // global对象，全局单例模式
  bind(DefaultGlobal).toSelf().inSingletonScope();
  bind(VGlobal).toService(DefaultGlobal);

  bind(DefaultWindow).to(DefaultWindow);
  bind(VWindow).toService(DefaultWindow);
  bind(DefaultGraphicUtil).toSelf().inSingletonScope();
  bind(GraphicUtil).toService(DefaultGraphicUtil);
  bind(DefaultTransformUtil).toSelf().inSingletonScope();
  bind(TransformUtil).toService(DefaultTransformUtil);
  bind(DefaultLayerService).toSelf().inSingletonScope();
  bind(LayerService).toService(DefaultLayerService);

  // bind(Stage).to(DefaultStage);
  // bind<(params: Partial<IStageParams>) => IStage>(StageFactory).toFactory<IStage>((context: interface.Context) => {
  //   return (params: Partial<IStageParams>) => {
  //     const g = context.container.get<IGlobal>(Global);
  //     const ws = context.container.get<IWindow>(VWindow);
  //     const rs = context.container.get<IRenderService>(RenderService);
  //     const layer = context.container.get<ILayer>(Layer);
  //     return new DefaultStage(params, g, ws, rs, layer);
  //   };
  // });
  // bind(Layer).to(DefaultLayer);
});
