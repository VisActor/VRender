import type { EasingType } from '@visactor/vrender-core';
import { ACustomAnimate } from './custom-animate';

export class FromTo extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  keys: string[];

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: any) {
    super(from, to, duration, easing, params);
    this.from = from;
    this.to = to;
  }

  onBind(): void {
    super.onBind();
    const finalAttribute = this.target.getFinalAttribute();
    const currAttribute = this.target.attribute;
    // 要同步from和to
    const fromKeys = Object.keys(this.from);
    const toKeys = Object.keys(this.to);
    fromKeys.forEach(key => {
      if (this.to[key] == null) {
        this.to[key] = finalAttribute[key] ?? 0;
      }
    });
    toKeys.forEach(key => {
      if (this.from[key] == null) {
        this.from[key] = (currAttribute as any)[key] ?? 0;
      }
    });
    this.propKeys = Object.keys(this.from);

    // TODO：比较hack
    // 如果是入场动画，那么还需要设置属性
    if (this.target.context?.animationState === 'appear') {
      // 用于入场的时候设置属性（因为有动画的时候VChart不会再设置属性了）
      const finalAttribute = this.target.getFinalAttribute();
      this.target.setAttributes(finalAttribute);
    }
  }

  update(end: boolean, ratio: number, out: Record<string, any>): void {
    this.onStart();
    if (!this.props || !this.propKeys) {
      return;
    }
    // 应用缓动函数
    const easedRatio = this.easing(ratio);
    this.interpolateUpdateFunctions.forEach((func, index) => {
      // 如果这个属性被屏蔽了，直接跳过
      if (!this.animate.validAttr(this.propKeys[index])) {
        return;
      }
      const key = this.propKeys[index];
      const fromValue = this.from[key];
      const toValue = this.to[key];
      func(key, fromValue, toValue, easedRatio, this, this.target);
    });
    this.onUpdate(end, easedRatio, out);
    this.syncAttributeUpdate();
  }
}
