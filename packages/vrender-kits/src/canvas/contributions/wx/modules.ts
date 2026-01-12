import { WxCanvas } from './canvas';
import { WxContext2d } from './context';
import { registerCanvasFactories } from '../create-canvas-module';

export function registerWxCanvasFactories() {
  registerCanvasFactories(WxCanvas, WxContext2d);
}
