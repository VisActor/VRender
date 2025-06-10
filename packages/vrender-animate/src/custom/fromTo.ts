import type { EasingType } from '@visactor/vrender-core';
import { ACustomAnimate } from './custom-animate';

export class FromTo extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  keys: string[];

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: any) {
    super(from, to, duration, easing, params);
    this.from = from ?? {};
  }

  onBind(): void {
    super.onBind();

    // 如果存在from，不存在to，那么需要设置给props
    Object.keys(this.from).forEach(key => {
      if (this.props[key] == null) {
        this.props[key] = this.target.getGraphicAttribute(key);
      }
    });

    const finalAttribute = this.target.getFinalAttribute();
    // 如果入场动画，那么需要设置属性
    if (this.target.context?.animationState === 'appear') {
      if (finalAttribute) {
        this.target.setAttributes(finalAttribute);
      }
    }
    if (this.params.controlOptions?.immediatelyApply !== false) {
      this.target.setAttributes(this.from);
    }
  }

  onFirstRun(): void {
    // 获取上一步的属性值作为起始值
    this.from = { ...this.getLastProps(), ...this.from };
    const startProps = this.animate.getStartProps();
    this.propKeys &&
      this.propKeys.forEach(key => {
        this.from[key] = this.from[key] ?? startProps[key];
      });
    // TODO：比较hack
    // 如果是入场动画，那么还需要设置属性
    // if (this.target.context?.animationState === 'appear') {
    //   // 用于入场的时候设置属性（因为有动画的时候VChart不会再设置属性了）
    //   const finalAttribute = this.target.getFinalAttribute();
    //   this.target.setAttributes(finalAttribute);
    // }
    this.target.setAttributes(this.from);
  }

  /**
   * 更新执行的时候调用
   * 如果跳帧了就不一定会执行
   */
  update(end: boolean, ratio: number, out: Record<string, any>): void {
    // TODO 需要修复，只有在开始的时候才调用
    this.onStart();
    if (!this.props || !this.propKeys) {
      return;
    }
    // 应用缓动函数
    const easedRatio = this.easing(ratio);
    this.animate.interpolateUpdateFunction
      ? this.animate.interpolateUpdateFunction(this.from, this.props, easedRatio, this, this.target)
      : this.interpolateUpdateFunctions.forEach((func, index) => {
          // 如果这个属性被屏蔽了，直接跳过
          if (!this.animate.validAttr(this.propKeys[index])) {
            return;
          }
          const key = this.propKeys[index];
          const fromValue = this.from[key];
          const toValue = this.props[key];
          func(key, fromValue, toValue, easedRatio, this, this.target);
        });
    this.onUpdate(end, easedRatio, out);
    this.syncAttributeUpdate();
  }
}
