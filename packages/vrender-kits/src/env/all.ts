import { contributionRegistry, vglobal } from '@visactor/vrender-core';
import { registerBrowserEnvRegistry } from './browser';
import { registerFeishuEnvRegistry } from './feishu';
import { registerLynxEnvRegistry } from './lynx';
import { registerNodeEnvRegistry } from './node';
import { registerTaroEnvRegistry } from './taro';
import { registerWxEnvRegistry } from './wx';
import { registerCanvasPickerService } from '../picker/canvas-module';
import { registerMathPickerService } from '../picker/math-module';
// import { loadMathPicker } from '../picker';

export function loadAllEnv() {
  loadAllModule();
}

export function loadAllModule() {
  if (!loadAllModule.__loaded) {
    loadAllModule.__loaded = true;
    registerBrowserEnvRegistry();
    registerFeishuEnvRegistry();
    registerLynxEnvRegistry();
    registerNodeEnvRegistry();
    registerTaroEnvRegistry();
    registerWxEnvRegistry();
    registerCanvasPickerService();
    vglobal.hooks.onSetEnv.tap('registerMathPickerService', (lastEnv, env) => {
      env !== 'browser' && registerMathPickerService();
    });
  }
}

loadAllModule.__loaded = false;

export function initAllEnv() {
  loadAllEnv();
}
