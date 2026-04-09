import { BrowserCanvas } from './canvas';
import { BrowserContext2d } from './context';
import { createModule } from '../create-canvas-module';

export const bindBrowserCanvasModules = createModule(BrowserCanvas, BrowserContext2d);
