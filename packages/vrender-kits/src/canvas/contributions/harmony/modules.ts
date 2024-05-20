import { HarmonyCanvas } from './canvas';
import { HarmonyContext2d } from './context';
import { createModule } from '../create-canvas-module';

export const harmonyCanvasModule = createModule(HarmonyCanvas, HarmonyContext2d);
