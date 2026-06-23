import { NodeCanvas } from './canvas';
import { NodeContext2d } from './context';
import { createModule } from '../create-canvas-module';

export const bindNodeCanvasModules = createModule(NodeCanvas, NodeContext2d);
