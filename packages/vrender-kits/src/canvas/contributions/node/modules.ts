import { NodeCanvas } from './canvas';
import { NodeContext2d } from './context';
import { registerCanvasFactories } from '../create-canvas-module';

export function registerNodeCanvasFactories() {
  registerCanvasFactories(NodeCanvas, NodeContext2d);
}
