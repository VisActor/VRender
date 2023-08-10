import { ContainerModule } from 'inversify';
import { CanvasFactory, Context2dFactory } from '@visactor/vrender';
import type { CanvasConfigType, ICanvas } from '@visactor/vrender';
import { NativeCanvas } from './native-canvas';
import { NativeContext2d } from './native-context';

export const nativeCanvasContribution = new ContainerModule(bind => {
  bind(CanvasFactory)
    .toDynamicValue(() => {
      return (params: CanvasConfigType) => new NativeCanvas(params);
    })
    .whenTargetNamed(NativeCanvas.env);

  bind(Context2dFactory)
    .toDynamicValue(() => {
      return (params: ICanvas, dpr: number) => new NativeContext2d(params, dpr);
    })
    .whenTargetNamed(NativeContext2d.env);
});
