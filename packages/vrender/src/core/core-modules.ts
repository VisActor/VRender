import { ContainerModule } from 'inversify';
import { DefaultGlobal } from './global';
import { DefaultGraphicUtil, DefaultTransformUtil } from './graphic-utils';
import { DefaultLayerService } from './layer-service';
import { DefaultWindow, Window } from './window';
import { GraphicUtil, LayerService, TransformUtil } from './constants';
import { Global } from '../constants';

export default new ContainerModule(bind => {
  // global对象，全局单例模式
  bind(DefaultGlobal).toSelf().inSingletonScope();
  bind(Global).toService(DefaultGlobal);

  bind(DefaultWindow).to(DefaultWindow);
  bind(Window).toService(DefaultWindow);
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
  //     const ws = context.container.get<IWindow>(Window);
  //     const rs = context.container.get<IRenderService>(RenderService);
  //     const layer = context.container.get<ILayer>(Layer);
  //     return new DefaultStage(params, g, ws, rs, layer);
  //   };
  // });
  // bind(Layer).to(DefaultLayer);
});
