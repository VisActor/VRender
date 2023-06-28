import { ContainerModule } from 'inversify';
import { TaroCanvas } from './canvas';
import { TaroContext2d } from './context';
import { CanvasFactory, Context2dFactory } from '../../constants';
import type { CanvasConfigType, ICanvas } from '../../../interface';

export default new ContainerModule(bind => {
  bind(CanvasFactory)
    .toDynamicValue(() => {
      return (params: CanvasConfigType) => new TaroCanvas(params);
    })
    .whenTargetNamed(TaroCanvas.env);

  bind(Context2dFactory)
    .toDynamicValue(() => {
      return (params: ICanvas, dpr: number) => new TaroContext2d(params, dpr);
    })
    .whenTargetNamed(TaroContext2d.env);
});
