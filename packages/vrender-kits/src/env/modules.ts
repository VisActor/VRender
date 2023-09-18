import type { Container } from '@visactor/vrender-core';
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

export function loadAllModule(container: Container) {
  container.load(allEnvModule);
  loadAllCavnvas(container);
  container.load(allWindowModule);
}

export function loadBrowserEnv(container: Container) {
  container.load(browserEnvModule);
  container.load(browserCanvasModule);
  container.load(browserWindowModule);
}

export function loadFeishuEnv(container: Container) {
  container.load(feishuEnvModule);
  container.load(feishuCanvasModule);
  container.load(feishuWindowModule);
}

export function loadLynxEnv(container: Container) {
  container.load(lynxEnvModule);
  container.load(lynxCanvasModule);
  container.load(lynxWindowModule);
}

export function loadNodeEnv(container: Container) {
  container.load(nodeEnvModule);
  container.load(nodeCanvasModule);
  container.load(nodeWindowModule);
}

export function loadTaroEnv(container: Container) {
  container.load(taroEnvModule);
  container.load(taroCanvasModule);
  container.load(taroWindowModule);
}

export function loadWxEnv(container: Container) {
  container.load(wxEnvModule);
  container.load(wxCanvasModule);
  container.load(wxWindowModule);
}
