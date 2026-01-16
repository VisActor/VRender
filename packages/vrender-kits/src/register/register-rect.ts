import {
  contributionRegistry,
  DefaultBaseInteractiveRenderContribution,
  DefaultCanvasRectRender,
  GraphicRender,
  RectRenderContribution,
  registerRectGraphic,
  serviceRegistry,
  SplitRectAfterRenderContribution,
  SplitRectBeforeRenderContribution
} from '@visactor/vrender-core';
import { browser } from './env';
import { registerCanvasRectPicker } from '../picker/contributions/canvas-picker/rect-module';
import { registerMathRectPicker } from '../picker/contributions/math-picker/rect-module';

function _registerRect() {
  if (_registerRect.__loaded) {
    return;
  }
  _registerRect.__loaded = true;
  registerRectGraphic();
  if (browser) {
    registerCanvasRectPicker();
  } else {
    registerMathRectPicker();
  }
  contributionRegistry.register(RectRenderContribution, new SplitRectAfterRenderContribution());
  contributionRegistry.register(RectRenderContribution, new SplitRectBeforeRenderContribution());
  contributionRegistry.register(RectRenderContribution, serviceRegistry.get(DefaultBaseInteractiveRenderContribution));

  contributionRegistry.register(GraphicRender, new DefaultCanvasRectRender());
}

_registerRect.__loaded = false;

export const registerRect = _registerRect;
