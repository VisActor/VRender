// 1. 支持animate函数
// 2. 支持animates map
// 2. 支持animatedAttribute 为所有动画的最终结果（loop为INFINITY的动画不算）
// 3. 支持finalAttribute 为所有动画的最终结果（animatedAttribute 合并了 graphic.attribute之后的最终结果）
// 3. 重载Graphic的getAttributes方法，根据参数getAttributes(final = true)返回finalAttribute = {}; merge(finalAttribute, graphic.attribute, animatedAttribute)，
// animatedAttribute为所有动画的最终结果（loop为INFINITY的动画不算）

import type { IGraphicAnimateParams, IAnimate } from '@visactor/vrender-core';
import { Animate } from './animate';
import { DefaultTimeline, defaultTimeline } from './timeline';
import { DefaultTicker } from './ticker/default-ticker';
import type { IAnimationConfig } from './executor/executor';
import { AnimateExecutor } from './executor/animate-executor';

// 基于性能考虑，每次调用animate函数，都会设置animatedAttribute为null，每次getAttributes(true)会根据animatedAttribute属性判断是否需要重新计算animatedAttribute。
export class AnimateExtension {
  declare finalAttribute: Record<string, any>;
  _animateExecutor: AnimateExecutor | null;

  declare animates: Map<string | number, IAnimate>;

  getAttributes(final: boolean = false) {
    if (final && this.finalAttribute) {
      return this.finalAttribute;
    }
    return (this as any).attribute;
  }

  animate(params?: IGraphicAnimateParams) {
    const animate = new Animate(
      params?.id,
      params?.timeline ?? ((this as any).stage && (this as any).stage.getTimeline()) ?? defaultTimeline,
      params?.slience
    );

    animate.bind(this as any);
    if (params) {
      const { onStart, onEnd, onRemove } = params;
      onStart != null && animate.onStart(onStart);
      onEnd != null && animate.onEnd(onEnd);
      onRemove != null && animate.onRemove(onRemove);
    }

    // TODO 考虑性能问题
    (this as any).stage?.ticker.start();

    return animate;
  }

  createTimeline() {
    return new DefaultTimeline();
  }

  createTicker(stage: any) {
    return new DefaultTicker(stage);
  }

  setFinalAttributes(finalAttribute: Record<string, any>) {
    if (!this.finalAttribute) {
      this.finalAttribute = {};
    }
    Object.assign(this.finalAttribute, finalAttribute);
  }

  initFinalAttributes(finalAttribute: Record<string, any>) {
    this.finalAttribute = finalAttribute;
  }

  initAnimateExecutor(): void {
    if (!this._animateExecutor) {
      this._animateExecutor = new AnimateExecutor(this as any);
    }
  }

  /**
   * Apply animation configuration to the component
   * @param config Animation configuration
   * @returns This component instance
   */
  executeAnimation(config: IAnimationConfig): this {
    this.initAnimateExecutor();
    this._animateExecutor.execute(config);
    return this;
  }

  /**
   * Apply animations to multiple components
   * @param configs Animation configurations
   * @returns This component instance
   */
  executeAnimations(configs: IAnimationConfig[]): this {
    this.initAnimateExecutor();
    configs.forEach(config => {
      this._animateExecutor.execute(config);
    });
    return this;
  }

  protected getFinalAttribute() {
    return this.finalAttribute;
  }

  // TODO prev是兼容原本VGrammar函数的一个参数，用于动画中获取上一次属性，目前的逻辑中应该不需要，直接去当前帧的属性即可
  getGraphicAttribute(key: string, prev: boolean = false) {
    if (!prev && this.finalAttribute) {
      return this.finalAttribute[key];
    }
    return (this as any).attribute[key];
  }
}
