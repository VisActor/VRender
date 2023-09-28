import { container, vglobal, type Container } from '@visactor/vrender-core';
import { loadBrowserEnv } from './browser';
import { loadFeishuEnv } from './feishu';
import { loadLynxEnv } from './lynx';
import { loadNodeEnv } from './node';
import { loadTaroEnv } from './taro';
import { loadWxEnv } from './wx';
import { loadCanvasPicker } from '../picker/canvas-module';
import { loadMathPicker } from '../picker';

export function loadAllEnv(container: Container) {
  loadAllModule(container);
}

export function loadAllModule(container: Container) {
  loadBrowserEnv(container, false);
  loadFeishuEnv(container, false);
  loadLynxEnv(container, false);
  loadNodeEnv(container, false);
  loadTaroEnv(container, false);
  loadWxEnv(container, false);
  loadCanvasPicker(container);
  vglobal.hooks.onSetEnv.tap('loadMathPicker', (lastEnv, env) => {
    env !== 'browser' && loadMathPicker(container);
  });
}

export function initAllEnv() {
  loadAllEnv(container);
}
