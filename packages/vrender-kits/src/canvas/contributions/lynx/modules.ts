import { LynxCanvas } from './canvas';
import { LynxContext2d } from './context';
import { registerCanvasFactories } from '../create-canvas-module';

export function registerLynxCanvasFactories() {
  registerCanvasFactories(LynxCanvas, LynxContext2d);
}
