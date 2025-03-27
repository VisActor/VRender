// 1. 支持animate函数
// 2. 支持animates map
// 2. 支持animatedAttribute 为所有动画的最终结果（loop为INFINITY的动画不算）
// 3. 支持finalAttribute 为所有动画的最终结果（animatedAttribute 合并了 graphic.attribute之后的最终结果）
// 3. 重载Graphic的getAttributes方法，根据参数getAttributes(final = true)返回finalAttribute = {}; merge(finalAttribute, graphic.attribute, animatedAttribute)，
// animatedAttribute为所有动画的最终结果（loop为INFINITY的动画不算）

import type { IGraphicAnimateParams } from '@visactor/vrender-core';
import type { IAnimate } from './intreface/animate';
import { Animate } from './animate';
import { DefaultTimeline, defaultTimeline } from './timeline';
import { DefaultTicker } from './ticker/default-ticker';

// 基于性能考虑，每次调用animate函数，都会设置animatedAttribute为null，每次getAttributes(true)会根据animatedAttribute属性判断是否需要重新计算animatedAttribute。
export class AnimateExtension {
  declare finalAttribute: Record<string, any>;

  declare animates: Map<string | number, IAnimate>;

  getAttributes(final: boolean = false) {
    if (final && this.finalAttribute) {
      return this.finalAttribute;
    }
    return (this as any).attribute;
  }

  animate(params?: IGraphicAnimateParams) {
    if (!this.animates) {
      this.animates = new Map();
    }
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
    this.animates.set(animate.id, animate);
    animate.onRemove(() => {
      animate.stop();
      this.animates.delete(animate.id);
    });

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

  setFinalAttribute(finalAttribute: Record<string, any>) {
    if (!this.finalAttribute) {
      this.finalAttribute = {};
    }
    Object.assign(this.finalAttribute, finalAttribute);
  }

  initFinalAttribute(finalAttribute: Record<string, any>) {
    this.finalAttribute = finalAttribute;
  }

  protected getFinalAttribute() {
    return this.finalAttribute;
  }
}
