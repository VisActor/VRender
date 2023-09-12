import { ContainerModule } from '../../../common/inversify-lite';
import { BrowserCanvas } from './canvas';
import { BrowserContext2d } from './context';
import { CanvasFactory, Context2dFactory } from '../../constants';
import type { CanvasConfigType, ICanvas } from '../../../interface';

export default new ContainerModule(bind => {
  bind(CanvasFactory)
    .toDynamicValue(() => {
      return (params: CanvasConfigType) => new BrowserCanvas(params);
    })
    .whenTargetNamed(BrowserCanvas.env);

  bind(Context2dFactory)
    .toDynamicValue(() => {
      return (params: ICanvas, dpr: number) => new BrowserContext2d(params, dpr);
    })
    .whenTargetNamed(BrowserContext2d.env);
});
