import type { EasingType } from '../intreface/easing';
import { CommonIn, CommonOut } from './common';

export interface IScaleAnimationOptions {
  direction?: 'x' | 'y' | 'xy';
}

export class FadeIn extends CommonIn {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IScaleAnimationOptions) {
    super(from, to, duration, easing, params);
    this.keys = ['opacity'];
  }
}

export class FadeOut extends CommonOut {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IScaleAnimationOptions) {
    super(from, to, duration, easing, params);
    this.keys = ['opacity'];
  }
}
