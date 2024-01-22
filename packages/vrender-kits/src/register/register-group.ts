import { registerGroupGraphic } from '@visactor/vrender-core';

function _registerGroup() {
  if (_registerGroup.__loaded) {
    return;
  }
  _registerGroup.__loaded = true;
  registerGroupGraphic();
}

_registerGroup.__loaded = false;

export const registerGroup = _registerGroup;
