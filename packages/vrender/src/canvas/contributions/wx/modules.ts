import { ContainerModule } from '../../../common/inversify-lite';
import { WxCanvas } from './canvas';
import { WxContext2d } from './context';
import { CanvasFactory, Context2dFactory } from '../../constants';
import type { CanvasConfigType, ICanvas } from '../../../interface';

export default new ContainerModule(bind => {
  bind(CanvasFactory)
    .toDynamicValue(() => {
      return (params: CanvasConfigType) => new WxCanvas(params);
    })
    .whenTargetNamed(WxCanvas.env);

  bind(Context2dFactory)
    .toDynamicValue(() => {
      return (params: ICanvas, dpr: number) => new WxContext2d(params, dpr);
    })
    .whenTargetNamed(WxContext2d.env);
});
