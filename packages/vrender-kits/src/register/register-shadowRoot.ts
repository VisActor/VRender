import { registerShadowRootGraphic } from '@visactor/vrender-core';

let loaded = false;
export function registerShadowRoot() {
  if (loaded) {
    return;
  }
  loaded = true;
  registerShadowRootGraphic();
}
