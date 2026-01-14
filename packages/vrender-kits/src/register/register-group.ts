import {
  contributionRegistry,
  DefaultCanvasGroupRender,
  GraphicRender,
  registerGroupGraphic
} from '@visactor/vrender-core';

function _registerGroup() {
  if (_registerGroup.__loaded) {
    return;
  }
  _registerGroup.__loaded = true;
  registerGroupGraphic();

  contributionRegistry.register(GraphicRender, new DefaultCanvasGroupRender());
}

_registerGroup.__loaded = false;

export const registerGroup = _registerGroup;
