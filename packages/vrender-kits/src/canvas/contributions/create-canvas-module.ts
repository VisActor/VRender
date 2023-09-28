import { ContainerModule, CanvasFactory, Context2dFactory } from '@visactor/vrender-core';
import type { CanvasConfigType, ICanvas } from '@visactor/vrender-core';

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
