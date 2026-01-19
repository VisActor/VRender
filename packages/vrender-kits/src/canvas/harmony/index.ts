import { HarmonyCanvas } from './canvas';
import { HarmonyContext2d } from './context';
import { registerCanvasFactories } from '../create-canvas-module';

export function registerHarmonyCanvasFactories() {
  registerCanvasFactories(HarmonyCanvas, HarmonyContext2d);
}

export { HarmonyCanvas, HarmonyContext2d };
