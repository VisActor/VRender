import { application, CanvasFactory, Context2dFactory } from '@visactor/vrender-core';
import type { CanvasConfigType, ICanvas } from '@visactor/vrender-core';

// Register canvas/context factories via application.services (no inversify)
export function registerCanvasFactories(CanvasConstructor: any, ContextConstructor: any) {
  // Canvas factory
  application.services.registerFactory(CanvasFactory, () => {
    return (params: CanvasConfigType) => new CanvasConstructor(params);
  });

  // Context2d factory
  application.services.registerFactory(Context2dFactory, () => {
    return (canvas: ICanvas, dpr: number) => new ContextConstructor(canvas, dpr);
  });
}
