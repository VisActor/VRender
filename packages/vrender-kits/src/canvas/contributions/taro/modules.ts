import { TaroCanvas } from './canvas';
import { TaroContext2d } from './context';
import { registerCanvasFactories } from '../create-canvas-module';

export function registerTaroCanvasFactories() {
  registerCanvasFactories(TaroCanvas, TaroContext2d);
}
