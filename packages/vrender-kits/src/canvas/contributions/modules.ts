import type { Container } from '@visactor/vrender-core';
import { browserCanvasModule } from './browser/modules';
import { feishuCanvasModule } from './feishu/modules';
import { lynxCanvasModule } from './lynx/modules';
import { nodeCanvasModule } from './node/modules';
import { taroCanvasModule } from './taro/modules';
import { ttCanvasModule } from './tt/modules';
import { wxCanvasModule } from './wx/modules';

export function loadAllCavnvas(container: Container) {
  container.load(browserCanvasModule);
  container.load(feishuCanvasModule);
  container.load(lynxCanvasModule);
  container.load(nodeCanvasModule);
  container.load(taroCanvasModule);
  container.load(ttCanvasModule);
  container.load(wxCanvasModule);
}

export function loadBrowserCanvas(container: Container) {
  container.load(browserCanvasModule);
}

export function loadFeishuCanvas(container: Container) {
  container.load(feishuCanvasModule);
}

export function loadLynxCanvas(container: Container) {
  container.load(lynxCanvasModule);
}

export function loadNodeCanvas(container: Container) {
  container.load(nodeCanvasModule);
}

export function loadTaroCanvas(container: Container) {
  container.load(taroCanvasModule);
}

export function loadTTCanvas(container: Container) {
  container.load(ttCanvasModule);
}

export function loadWxCanvas(container: Container) {
  container.load(wxCanvasModule);
}
