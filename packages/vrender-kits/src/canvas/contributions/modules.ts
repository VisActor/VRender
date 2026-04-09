import { bindBrowserCanvasModules } from './browser/modules';
import { bindFeishuCanvasModules } from './feishu/modules';
import { bindLynxCanvasModules } from './lynx/modules';
import { bindNodeCanvasModules } from './node/modules';
import { bindTaroCanvasModules } from './taro/modules';
import { bindTTCanvasModules } from './tt/modules';
import { bindWxCanvasModules } from './wx/modules';
import type { LegacyContainer } from '../../common/legacy-container';

export function loadAllCavnvas(container: LegacyContainer) {
  bindBrowserCanvasModules(container);
  bindFeishuCanvasModules(container);
  bindLynxCanvasModules(container);
  bindNodeCanvasModules(container);
  bindTaroCanvasModules(container);
  bindTTCanvasModules(container);
  bindWxCanvasModules(container);
}

export function loadBrowserCanvas(container: LegacyContainer) {
  bindBrowserCanvasModules(container);
}

export function loadFeishuCanvas(container: LegacyContainer) {
  bindFeishuCanvasModules(container);
}

export function loadLynxCanvas(container: LegacyContainer) {
  bindLynxCanvasModules(container);
}

export function loadNodeCanvas(container: LegacyContainer) {
  bindNodeCanvasModules(container);
}

export function loadTaroCanvas(container: LegacyContainer) {
  bindTaroCanvasModules(container);
}

export function loadTTCanvas(container: LegacyContainer) {
  bindTTCanvasModules(container);
}

export function loadWxCanvas(container: LegacyContainer) {
  bindWxCanvasModules(container);
}
