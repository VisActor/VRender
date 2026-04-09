import { WxCanvas } from './canvas';
import { WxContext2d } from './context';
import { createModule } from '../create-canvas-module';

export const bindWxCanvasModules = createModule(WxCanvas, WxContext2d);
