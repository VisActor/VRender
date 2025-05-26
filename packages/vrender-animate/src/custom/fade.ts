import type { EasingType } from '@visactor/vrender-core';
import { CommonIn, CommonOut } from './common';

export interface IScaleAnimationOptions {
  direction?: 'x' | 'y' | 'xy';
}

export class FadeIn extends CommonIn {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IScaleAnimationOptions) {
    super(from, to, duration, easing, params);
    this.keys = ['opacity', 'fillOpacity', 'strokeOpacity'];
    this.from = { opacity: 0, fillOpacity: 0, strokeOpacity: 0 };
  }
}

export class FadeOut extends CommonOut {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IScaleAnimationOptions) {
    super(from, to, duration, easing, params);
    this.keys = ['opacity', 'fillOpacity', 'strokeOpacity'];
  }
}
