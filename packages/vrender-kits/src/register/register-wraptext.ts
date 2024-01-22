import { registerWrapTextGraphic } from '@visactor/vrender-core';

function _registerWrapText() {
  if (_registerWrapText.__loaded) {
    return;
  }
  _registerWrapText.__loaded = true;
  registerWrapTextGraphic();
}
_registerWrapText.__loaded = false;

export const registerWrapText = _registerWrapText;
