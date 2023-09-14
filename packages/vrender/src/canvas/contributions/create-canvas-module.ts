import { ContainerModule } from '../../common/inversify-lite';
import type { CanvasConfigType, ICanvas } from '../../interface';
import { CanvasFactory, Context2dFactory } from '../constants';

export function createModule(CanvasConstructor: any, ContextConstructor: any) {
  return new ContainerModule(bind => {
    bind(CanvasFactory)
      .toDynamicValue(() => {
        return (params: CanvasConfigType) => new CanvasConstructor(params);
      })
      .whenTargetNamed(CanvasConstructor.env);

    bind(Context2dFactory)
      .toDynamicValue(() => {
        return (params: ICanvas, dpr: number) => new ContextConstructor(params, dpr);
      })
      .whenTargetNamed(ContextConstructor.env);
  });
}
