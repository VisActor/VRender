import { ContainerModule } from 'inversify';
import { FeishuCanvas } from './canvas';
import { FeishuContext2d } from './context';
import { CanvasFactory, Context2dFactory } from '../../constants';
import type { CanvasConfigType, ICanvas } from '../../../interface';

export default new ContainerModule(bind => {
  bind(CanvasFactory)
    .toDynamicValue(() => {
      return (params: CanvasConfigType) => new FeishuCanvas(params);
    })
    .whenTargetNamed(FeishuCanvas.env);

  bind(Context2dFactory)
    .toDynamicValue(() => {
      return (params: ICanvas, dpr: number) => new FeishuContext2d(params, dpr);
    })
    .whenTargetNamed(FeishuContext2d.env);
});
