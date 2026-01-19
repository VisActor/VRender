import {
  AreaIncrementalDrawContribution,
  AreaRenderContribution,
  contributionRegistry,
  DefaultBaseInteractiveRenderContribution,
  DefaultCanvasAreaRender,
  DefaultIncrementalCanvasAreaRender,
  GraphicRender,
  registerAreaGraphic,
  serviceRegistry
} from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasAreaPicker } from '../picker/contributions/canvas-picker/area-module';
import { registerMathAreaPicker } from '../picker/contributions/math-picker/area-module';

function _registerArea() {
  if (_registerArea.__loaded) {
    return;
  }
  _registerArea.__loaded = true;
  registerAreaGraphic();
  if (browser) {
    registerCanvasAreaPicker();
  } else {
    registerMathAreaPicker();
  }
  serviceRegistry.registerSingletonFactory(
    AreaIncrementalDrawContribution,
    () => new DefaultIncrementalCanvasAreaRender()
  );

  contributionRegistry.register(AreaRenderContribution, serviceRegistry.get(DefaultBaseInteractiveRenderContribution));
  contributionRegistry.register(GraphicRender, new DefaultCanvasAreaRender());
}

_registerArea.__loaded = false;

export const registerArea = _registerArea;
