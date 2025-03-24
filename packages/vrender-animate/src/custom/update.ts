import type { IAnimate, IStep } from '../intreface/animate';
import type { EasingType } from '../intreface/easing';
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
export class Update extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;
  params: IUpdateAnimationOptions;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IUpdateAnimationOptions) {
    const { diffAttrs = {} } = params;
    super(from, diffAttrs, duration, easing, params);
    this.params = params;
  }

  update(end: boolean, ratio: number, out: Record<string, any>): void {
    this.onStart();
    if (!this.props || !this.propKeys) {
      return;
    }
    // 应用缓动函数
    const easedRatio = this.easing(ratio);
    this.animate.interpolateUpdateFunction
      ? this.animate.interpolateUpdateFunction(this.fromProps, this.props, easedRatio, this, this.target)
      : this.interpolateUpdateFunctions.forEach((func, index) => {
          // 如果这个属性被屏蔽了，直接跳过
          if (!this.animate.validAttr(this.propKeys[index])) {
            return;
          }
          const key = this.propKeys[index];
          const fromValue = this.fromProps[key];
          const toValue = this.props[key];
          func(key, fromValue, toValue, easedRatio, this, this.target);
        });
    this.onUpdate(end, easedRatio, out);
  }
}
