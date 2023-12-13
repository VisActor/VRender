import { registerGroupGraphic } from '@visactor/vrender-core';

let loaded = false;
export function registerGroup() {
  if (loaded) {
    return;
  }
  loaded = true;
  registerGroupGraphic();
}
