import {
  contributionRegistry,
  DefaultBaseInteractiveRenderContribution,
  DefaultCanvasPolygonRender,
  GraphicRender,
  PolygonRenderContribution,
  registerPolygonGraphic,
  serviceRegistry
} from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasPolygonPicker } from '../picker/contributions/canvas-picker/polygon-module';
import { registerMathPolygonPicker } from '../picker/contributions/math-picker/polygon-module';

function _registerPolygon() {
  if (_registerPolygon.__loaded) {
    return;
  }
  _registerPolygon.__loaded = true;
  registerPolygonGraphic();
  if (browser) {
    registerCanvasPolygonPicker();
  } else {
    registerMathPolygonPicker();
  }

  contributionRegistry.register(
    PolygonRenderContribution,
    serviceRegistry.get(DefaultBaseInteractiveRenderContribution)
  );

  contributionRegistry.register(GraphicRender, new DefaultCanvasPolygonRender());
}

_registerPolygon.__loaded = false;

export const registerPolygon = _registerPolygon;
