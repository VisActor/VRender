import type { EasingType } from '@visactor/vrender-core';
import { CommonIn, CommonOut } from './common';

export interface IScaleAnimationOptions {
  direction?: 'x' | 'y' | 'xy';
}

export class ClipIn extends CommonIn {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IScaleAnimationOptions) {
    super(from, to, duration, easing, params);
    this.keys = ['clipRange'];
    this.from = { clipRange: 0 };
  }
}

export class ClipOut extends CommonOut {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IScaleAnimationOptions) {
    super(from, to, duration, easing, params);
    this.keys = ['clipRange'];
  }
}
