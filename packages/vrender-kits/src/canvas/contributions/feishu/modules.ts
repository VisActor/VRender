import { FeishuCanvas } from './canvas';
import { FeishuContext2d } from './context';
import { createModule } from '../create-canvas-module';

export const bindFeishuCanvasModules = createModule(FeishuCanvas, FeishuContext2d);
