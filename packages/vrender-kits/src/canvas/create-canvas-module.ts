import { serviceRegistry, CanvasFactory, Context2dFactory } from '@visactor/vrender-core';
import type { CanvasConfigType, ICanvas } from '@visactor/vrender-core';

// Register canvas/context factories via serviceRegistry (no inversify)
export function registerCanvasFactories(CanvasConstructor: any, ContextConstructor: any) {
  // Canvas factory - directly register the factory function that creates Canvas instances
  serviceRegistry.registerFactory(CanvasFactory, (params: CanvasConfigType) => {
    return new CanvasConstructor(params);
  });

  // Context2d factory - directly register the factory function that creates Context instances
  serviceRegistry.registerFactory(Context2dFactory, (canvas: ICanvas, dpr: number) => {
    return new ContextConstructor(canvas, dpr);
  });
}
