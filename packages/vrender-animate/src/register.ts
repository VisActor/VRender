import { Graphic } from '@visactor/vrender-core';
import { mixin } from '@visactor/vutils';
import { GraphicStateExtension } from './state/graphic-extension';
import { AnimateExtension } from './animate-extension';

export function registerAnimate() {
  // Mix in animation state methods to Graphic prototype
  mixin(Graphic, GraphicStateExtension);
  mixin(Graphic, AnimateExtension);
}
