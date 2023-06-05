import { ContainerModule } from 'inversify';
import { TTCanvas } from './canvas';
import { TTContext2d } from './context';
import { CanvasFactory, Context2dFactory } from '../../interface';
import { CanvasConfigType, ICanvas } from '../../../interface';

export default new ContainerModule(bind => {
  bind(CanvasFactory)
    .toDynamicValue(() => {
      return (params: CanvasConfigType) => new TTCanvas(params);
    })
    .whenTargetNamed(TTCanvas.env);

  bind(Context2dFactory)
    .toDynamicValue(() => {
      return (params: ICanvas, dpr: number) => new TTContext2d(params, dpr);
    })
    .whenTargetNamed(TTContext2d.env);
});
