import { container, type Container } from '@visactor/vrender-core';
import {
  allEnvModule,
  browserEnvModule,
  feishuEnvModule,
  lynxEnvModule,
  nodeEnvModule,
  taroEnvModule,
  wxEnvModule
} from './contributions/module';
import { loadAllCavnvas } from '../canvas/contributions/modules';
import {
  allWindowModule,
  browserWindowModule,
  feishuWindowModule,
  lynxWindowModule,
  nodeWindowModule,
  taroWindowModule,
  wxWindowModule
} from '../window/contributions/modules';
import { browserCanvasModule } from '../canvas/contributions/browser/modules';
import { feishuCanvasModule } from '../canvas/contributions/feishu/modules';
import { lynxCanvasModule } from '../canvas/contributions/lynx/modules';
import { nodeCanvasModule } from '../canvas/contributions/node/modules';
import { taroCanvasModule } from '../canvas/contributions/taro/modules';
import { wxCanvasModule } from '../canvas/contributions/wx/modules';
import { loadCanvasPicker, loadMathPicker } from '../picker';

export function loadAllEnv(container: Container) {
  loadAllModule(container);
}

export function loadAllModule(container: Container) {
  container.load(allEnvModule);
  loadAllCavnvas(container);
  container.load(allWindowModule);
  loadCanvasPicker(container);
}

export function loadBrowserEnv(container: Container) {
  container.load(browserEnvModule);
  container.load(browserCanvasModule);
  container.load(browserWindowModule);
  loadCanvasPicker(container);
}

export function loadFeishuEnv(container: Container) {
  container.load(feishuEnvModule);
  container.load(feishuCanvasModule);
  container.load(feishuWindowModule);
  loadMathPicker(container);
}

export function loadLynxEnv(container: Container) {
  container.load(lynxEnvModule);
  container.load(lynxCanvasModule);
  container.load(lynxWindowModule);
  loadMathPicker(container);
}

export function loadNodeEnv(container: Container) {
  container.load(nodeEnvModule);
  container.load(nodeCanvasModule);
  container.load(nodeWindowModule);
  loadMathPicker(container);
}

export function loadTaroEnv(container: Container) {
  container.load(taroEnvModule);
  container.load(taroCanvasModule);
  container.load(taroWindowModule);
  loadMathPicker(container);
}

export function loadWxEnv(container: Container) {
  container.load(wxEnvModule);
  container.load(wxCanvasModule);
  container.load(wxWindowModule);
  loadMathPicker(container);
}

export function initAllEnv() {
  loadAllEnv(container);
}
export function initBrowserEnv() {
  loadBrowserEnv(container);
}
export function initFeishuEnv() {
  loadFeishuEnv(container);
}
export function initLynxEnv() {
  loadLynxEnv(container);
}
export function initNodeEnv() {
  loadNodeEnv(container);
}
export function initTaroEnv() {
  loadTaroEnv(container);
}
export function initWxEnv() {
  loadWxEnv(container);
}
