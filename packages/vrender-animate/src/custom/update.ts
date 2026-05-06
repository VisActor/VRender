import { AttributeUpdateType, type EasingType, type IAnimate, type IStep } from '@visactor/vrender-core';
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
  // params: IUpdateAnimationOptions;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IUpdateAnimationOptions) {
    super(from, to, duration, easing, params);
    // this.params = params;
  }

  onBind() {
    super.onBind();
    let { diffAttrs = {} } = this.target.context ?? ({} as any);
    const { options } = this.params as any;

    diffAttrs = { ...diffAttrs };
    if (options?.excludeChannels?.length) {
      options.excludeChannels.forEach((channel: string) => {
        delete diffAttrs[channel];
      });
    }

    this.props = diffAttrs;
  }

  private getStaticCommitAttrs(): Record<string, any> | null {
    if (!this.props) {
      return null;
    }

    const target = this.target as any;
    const contextFinalAttrs = target.context?.finalAttrs as Record<string, any> | undefined;
    const finalAttribute = (
      typeof target.getFinalAttribute === 'function' ? target.getFinalAttribute() : target.finalAttribute
    ) as Record<string, any> | undefined;
    const commitAttrs: Record<string, any> = {};

    Object.keys(this.props).forEach(key => {
      if (contextFinalAttrs && Object.prototype.hasOwnProperty.call(contextFinalAttrs, key)) {
        commitAttrs[key] = contextFinalAttrs[key];
        return;
      }

      if (finalAttribute && Object.prototype.hasOwnProperty.call(finalAttribute, key)) {
        commitAttrs[key] = finalAttribute[key];
        return;
      }

      if (this.animate.validAttr(key)) {
        commitAttrs[key] = (this.props as Record<string, any>)[key];
      }
    });

    return Object.keys(commitAttrs).length ? commitAttrs : null;
  }

  onEnd(cb?: (animate: IAnimate, step: IStep) => void): void {
    if (cb) {
      super.onEnd(cb);
      return;
    }

    const commitAttrs = this.getStaticCommitAttrs();
    if (commitAttrs) {
      this.target.setAttributes(commitAttrs, false, { type: AttributeUpdateType.ANIMATE_END });
    }
    super.onEnd();
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
