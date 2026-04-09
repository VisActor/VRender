import { CanvasFactory, Context2dFactory, type CanvasConfigType, type ICanvas } from '@visactor/vrender-core';
import type { LegacyBindContainer } from '../../common/legacy-container';

export function createModule(CanvasConstructor: any, ContextConstructor: any) {
  let loaded = false;

  return (bindingContainer: LegacyBindContainer) => {
    if (loaded) {
      return;
    }
    loaded = true;
    bindingContainer
      .bind(CanvasFactory)
      .toDynamicValue(() => {
        return (params: CanvasConfigType) => new CanvasConstructor(params);
      })
      .whenTargetNamed(CanvasConstructor.env);

    bindingContainer
      .bind(Context2dFactory)
      .toDynamicValue(() => {
        return (params: ICanvas, dpr: number) => new ContextConstructor(params, dpr);
      })
      .whenTargetNamed(ContextConstructor.env);
  };
}
