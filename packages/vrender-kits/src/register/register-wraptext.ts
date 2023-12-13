import { registerWrapTextGraphic } from '@visactor/vrender-core';

let loaded = false;
export function registerWrapText() {
  if (loaded) {
    return;
  }
  loaded = true;
  registerWrapTextGraphic();
}
