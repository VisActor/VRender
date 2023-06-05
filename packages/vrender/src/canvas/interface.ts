import { ICanvas, IContext2d } from '../interface';

export const CanvasFactory = Symbol.for('CanvasFactory');
export const Context2dFactory = Symbol.for('Context2dFactory');

export interface ICanvasFactory extends Function {
  (...params: any): ICanvas;
}

export interface IContext2dFactory extends Function {
  (...params: any): IContext2d;
}
