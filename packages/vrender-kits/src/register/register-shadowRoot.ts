import { registerShadowRootGraphic } from '@visactor/vrender-core';

function _registerShadowRoot() {
  if (_registerShadowRoot.__loaded) {
    return;
  }
  _registerShadowRoot.__loaded = true;
  registerShadowRootGraphic();
}

_registerShadowRoot.__loaded = false;

export const registerShadowRoot = _registerShadowRoot;
