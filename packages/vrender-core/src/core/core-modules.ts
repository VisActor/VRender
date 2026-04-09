import { DefaultGlobal } from './global';
import { DefaultGraphicUtil, DefaultTransformUtil } from './graphic-utils';
import { DefaultLayerService } from './layer-service';
import { DefaultWindow, VWindow } from './window';
import { GraphicUtil, LayerService, TransformUtil } from './constants';
import { EnvContribution, VGlobal } from '../constants';
import { createContributionProvider } from '../common/contribution-provider';
import { TextMeasureContribution } from './contributions/textMeasure/textMeasure-contribution';

export function bindCoreModules({ bind }: { bind: any }) {
  // global对象，全局单例模式
  bind(VGlobal)
    .toDynamicValue(
      ({ container }: { container: any }) => new DefaultGlobal(createContributionProvider(EnvContribution, container))
    )
    .inSingletonScope();

  bind(VWindow).to(DefaultWindow);
  bind(GraphicUtil)
    .toDynamicValue(
      ({ container }: { container: any }) =>
        new DefaultGraphicUtil(createContributionProvider(TextMeasureContribution, container))
    )
    .inSingletonScope();
  bind(TransformUtil).to(DefaultTransformUtil).inSingletonScope();
  bind(LayerService).to(DefaultLayerService).inSingletonScope();

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
}

export default bindCoreModules;
