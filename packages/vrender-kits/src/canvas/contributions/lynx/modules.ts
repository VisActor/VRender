import { LynxCanvas } from './canvas';
import { LynxContext2d } from './context';
import { createModule } from '../create-canvas-module';

export const bindLynxCanvasModules = createModule(LynxCanvas, LynxContext2d);
