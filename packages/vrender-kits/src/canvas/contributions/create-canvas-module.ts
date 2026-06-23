import { CanvasFactory, Context2dFactory, type CanvasConfigType, type ICanvas } from '@visactor/vrender-core';
import type { LegacyBindContainer } from '../../common/legacy-container';

export function createModule(CanvasConstructor: any, ContextConstructor: any) {
  return (
    bindingContainer: LegacyBindContainer & {
      getNamed?: (serviceIdentifier: unknown, name: string) => unknown;
    }
  ) => {
    const hasCanvasFactory = !!bindingContainer.getNamed?.(CanvasFactory, CanvasConstructor.env);
    const hasContextFactory = !!bindingContainer.getNamed?.(Context2dFactory, ContextConstructor.env);

    if (!hasCanvasFactory) {
      bindingContainer
        .bind(CanvasFactory)
        .toDynamicValue(() => {
          return (params: CanvasConfigType) => new CanvasConstructor(params);
        })
        .whenTargetNamed(CanvasConstructor.env);
    }

    if (!hasContextFactory) {
      bindingContainer
        .bind(Context2dFactory)
        .toDynamicValue(() => {
          return (params: ICanvas, dpr: number) => new ContextConstructor(params, dpr);
        })
        .whenTargetNamed(ContextConstructor.env);
    }
  };
}
