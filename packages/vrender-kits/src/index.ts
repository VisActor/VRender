import 'reflect-metadata';
import _roughModule from './render/contributions/rough/module';
import _canvasModuleLoader from './canvas/contributions/canvas-module';

export const roughModule = _roughModule;
export const canvasModuleLoader = _canvasModuleLoader;
// export { nodeLoader } from './node-bind'; // nodeLoader只在node入口暴露
