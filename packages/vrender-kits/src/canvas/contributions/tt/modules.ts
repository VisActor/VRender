import { TTCanvas } from './canvas';
import { TTContext2d } from './context';
import { registerCanvasFactories } from '../create-canvas-module';

export function registerTTCanvasFactories() {
  registerCanvasFactories(TTCanvas, TTContext2d);
}
