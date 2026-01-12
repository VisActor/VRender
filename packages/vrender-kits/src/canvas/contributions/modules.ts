import { registerBrowserCanvasFactories } from './browser/modules';
import { registerFeishuCanvasFactories } from './feishu/modules';
import { registerLynxCanvasFactories } from './lynx/modules';
import { registerNodeCanvasFactories } from './node/modules';
import { registerTaroCanvasFactories } from './taro/modules';
import { registerTTCanvasFactories } from './tt/modules';
import { registerWxCanvasFactories } from './wx/modules';

export function loadAllCavnvas() {
  registerBrowserCanvasFactories();
  registerFeishuCanvasFactories();
  registerLynxCanvasFactories();
  registerNodeCanvasFactories();
  registerTaroCanvasFactories();
  registerTTCanvasFactories();
  registerWxCanvasFactories();
}

export function loadBrowserCanvas() {
  registerBrowserCanvasFactories();
}

export function loadFeishuCanvas() {
  registerFeishuCanvasFactories();
}

export function loadLynxCanvas() {
  registerLynxCanvasFactories();
}

export function loadNodeCanvas() {
  registerNodeCanvasFactories();
}

export function loadTaroCanvas() {
  registerTaroCanvasFactories();
}

export function loadTTCanvas() {
  registerTTCanvasFactories();
}

export function loadWxCanvas() {
  registerWxCanvasFactories();
}
