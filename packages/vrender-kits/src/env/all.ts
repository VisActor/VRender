import { contributionRegistry, vglobal } from '@visactor/vrender-core';
import { loadBrowserEnv } from './browser';
import { loadFeishuEnv } from './feishu';
import { loadLynxEnv } from './lynx';
import { loadNodeEnv } from './node';
import { loadTaroEnv } from './taro';
import { loadWxEnv } from './wx';
import { registerCanvasPickerService } from '../picker/canvas-module';
import { registerMathPickerService } from '../picker/math-module';
// import { loadMathPicker } from '../picker';

export function loadAllEnv() {
  loadAllModule();
}

export function loadAllModule() {
  if (!loadAllModule.__loaded) {
    loadAllModule.__loaded = true;
    loadBrowserEnv();
    loadFeishuEnv();
    loadLynxEnv();
    loadNodeEnv();
    loadTaroEnv();
    loadWxEnv();
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
