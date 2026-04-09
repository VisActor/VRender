import { TTCanvas } from './canvas';
import { TTContext2d } from './context';
import { createModule } from '../create-canvas-module';

export const bindTTCanvasModules = createModule(TTCanvas, TTContext2d);
