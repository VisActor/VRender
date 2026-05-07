import type { EasingType } from '@visactor/vrender-core';
import { ACustomAnimate } from './custom-animate';

export interface IUpdateAnimationOptions {
  diffAttrs: Record<string, any>;
  animationState: string;
  diffState: string;
  data: Record<string, any>[];
}

/**
 * 文本输入动画，实现类似打字机的字符逐个显示效果
 * 支持通过beforeText和afterText参数添加前缀和后缀
 * 支持通过showCursor参数显示光标，cursorChar自定义光标字符
 */
export class State extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IUpdateAnimationOptions) {
    super(from, to, duration, easing, params);
  }

  update(end: boolean, ratio: number, out: Record<string, any>): void {
    this.onStart();
    if (!this.props || !this.propKeys) {
      return;
    }
    // 应用缓动函数
    const easedRatio = this.easing(ratio);
    this.runInterpolateUpdate(this.fromProps, this.props, easedRatio);
    this.onUpdate(end, easedRatio, out);
    this.syncAttributeUpdate();
  }
}
