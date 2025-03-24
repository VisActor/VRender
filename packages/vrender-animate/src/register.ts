import { Graphic } from '@visactor/vrender-core';
import { Animate } from './animate';
import { defaultTimeline, DefaultTimeline } from './timeline';
import { DefaultTicker } from './ticker/default-ticker';
import { mixin } from '@visactor/vutils';
import { GraphicStateExtension } from './state/graphic-extension';
import { AnimateExtension } from './animate-extension';

export function registerAnimate() {
  if (!(Graphic as any).Animate) {
    (Graphic as any).Animate = Animate;
  }
  if (!(Graphic as any).Timeline) {
    (Graphic as any).Timeline = DefaultTimeline;
  }
  if (!(Graphic as any).defaultTimeline) {
    (Graphic as any).defaultTimeline = defaultTimeline;
  }
  if (!(Graphic as any).Ticker) {
    (Graphic as any).Ticker = DefaultTicker;
  }

  // Mix in animation state methods to Graphic prototype
  mixin(Graphic, GraphicStateExtension);
  mixin(Graphic, AnimateExtension);
}
