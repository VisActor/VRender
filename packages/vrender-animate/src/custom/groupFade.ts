import type { EasingType, IGroup } from '@visactor/vrender-core';
import { ACustomAnimate } from './custom-animate';
import { CommonIn, CommonOut } from './common';

export class GroupFadeIn extends CommonIn {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: any) {
    super(from, to, duration, easing, params);
    this.keys = ['baseOpacity'];
    this.from = { baseOpacity: 0 };
  }
}

export class GroupFadeOut extends CommonOut {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: any) {
    super(from, to, duration, easing, params);
    this.keys = ['baseOpacity'];
  }
}
