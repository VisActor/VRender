import { TaroCanvas } from './canvas';
import { TaroContext2d } from './context';
import { createModule } from '../create-canvas-module';

export const bindTaroCanvasModules = createModule(TaroCanvas, TaroContext2d);
