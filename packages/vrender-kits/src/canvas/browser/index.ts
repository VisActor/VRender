import { BrowserCanvas } from './canvas';
import { BrowserContext2d } from './context';
import { registerCanvasFactories } from '../create-canvas-module';

export function registerBrowserCanvasFactories() {
  registerCanvasFactories(BrowserCanvas, BrowserContext2d);
}

export { BrowserCanvas, BrowserContext2d };
