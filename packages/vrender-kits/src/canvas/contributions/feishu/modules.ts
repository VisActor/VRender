import { FeishuCanvas } from './canvas';
import { FeishuContext2d } from './context';
import { registerCanvasFactories } from '../create-canvas-module';

export function registerFeishuCanvasFactories() {
  registerCanvasFactories(FeishuCanvas, FeishuContext2d);
}
