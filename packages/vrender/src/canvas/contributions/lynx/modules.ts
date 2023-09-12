import { ContainerModule } from '../../../common/inversify-lite';
import { LynxCanvas } from './canvas';
import { LynxContext2d } from './context';
import { CanvasFactory, Context2dFactory } from '../../constants';
import type { CanvasConfigType, ICanvas } from '../../../interface';

export default new ContainerModule(bind => {
  bind(CanvasFactory)
    .toDynamicValue(() => {
      return (params: CanvasConfigType) => new LynxCanvas(params);
    })
    .whenTargetNamed(LynxCanvas.env);

  bind(Context2dFactory)
    .toDynamicValue(() => {
      return (params: ICanvas, dpr: number) => new LynxContext2d(params, dpr);
    })
    .whenTargetNamed(LynxContext2d.env);
});
