import { BrowserCanvas } from './canvas';
import { BrowserContext2d } from './context';
import { createModule } from '../create-canvas-module';

export default createModule(BrowserCanvas, BrowserContext2d);
