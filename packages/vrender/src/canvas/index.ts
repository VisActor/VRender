import { container, global } from '../modules';
import { CanvasFactory, Context2dFactory, ICanvasFactory, IContext2dFactory } from './interface';
import { CanvasConfigType, ICanvas } from '../interface';

export function wrapCanvas(params: CanvasConfigType) {
  return container.getNamed<ICanvasFactory>(CanvasFactory, global.env)(params);
}

export function wrapContext(canvas: ICanvas, dpr: number) {
  return container.getNamed<IContext2dFactory>(Context2dFactory, global.env)(canvas, dpr);
}

export * from './interface';
export * from './empty-context';
export * from './contributions/browser';
