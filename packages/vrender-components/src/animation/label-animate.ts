import type { ILineGraphicAttribute, Line } from '@visactor/vrender-core';
import { AttributeUpdateType } from '@visactor/vrender-core/event/constant';
import type { IPointLike } from '@visactor/vutils';
import { createComponentAnimator } from '@visactor/vrender-animate/component';
import { AComponentAnimate, ACustomAnimate } from '@visactor/vrender-animate/custom/custom-animate';
import { IncreaseCount } from '@visactor/vrender-animate/custom/number';
import { AnimateExecutor } from '@visactor/vrender-animate/executor/animate-executor';

const animationFrame = { type: AttributeUpdateType.ANIMATE_UPDATE };

class RestoreLabelLine extends ACustomAnimate<ILineGraphicAttribute> {
  declare params: { getPoints: () => IPointLike[] | undefined };

  onBind(): void {
    this.onUpdate(false);
  }

  onUpdate(end: boolean): void {
    if (!this.animate.validAttr('points')) {
      return;
    }
    const points = end ? this.to.points : this.params.getPoints();
    (this.target as Line).applyAnimationTransientAttributes(
      { points: points ?? this.to.points, visible: !!points && this.to.visible },
      false,
      animationFrame
    );
  }
}

/**
 * LabelUpdate class handles the update animation for Label components
 */
export class LabelUpdate extends AComponentAnimate<any> {
  onBind(): void {
    const animator = createComponentAnimator(this.target);
    this._animator = animator;
    const duration = this.duration;
    const easing = this.easing;

    const {
      prevText,
      curText,
      prevLabelLine,
      curLabelLine,
      getRestoredLinePoints,
      increaseEffect = true
    } = this.params;
    const diff: Record<string, any> = {};

    for (const key in curText.attribute) {
      if (prevText.attribute[key] !== curText.attribute[key]) {
        diff[key] = curText.attribute[key];
      }
    }

    const rest = { ...diff };
    delete rest.text;

    animator.animate(prevText, {
      type: 'to',
      to: rest,
      duration,
      easing
    });

    if (increaseEffect !== false) {
      animator.animate(prevText, {
        type: 'increaseCount',
        to: {
          text: curText.attribute.text
        },
        duration,
        easing
      });
    }

    if (getRestoredLinePoints) {
      // Run after the text animations so the line reads the bounds of the current frame.
      animator.animate(prevLabelLine ?? curLabelLine, {
        custom: RestoreLabelLine,
        customParameters: { getPoints: getRestoredLinePoints },
        to: { points: curLabelLine.attribute.points, visible: curLabelLine.attribute.visible ?? true },
        duration,
        easing
      });
    } else if (prevLabelLine && curLabelLine) {
      animator.animate(prevLabelLine, {
        type: 'to',
        to: curLabelLine.attribute,
        duration,
        easing
      });
    }

    this.completeBind(animator);
  }

  // 标签动画本身没有逻辑，具体通过animator中执行，所以本身不需要屏蔽冲突
  protected tryPreventConflict(): void {
    return;
  }
}

export class LabelEnter extends AComponentAnimate<any> {
  onBind(): void {
    const animator = createComponentAnimator(this.target);
    this._animator = animator;
    const duration = this.duration;
    const easing = this.easing;

    const { relatedGraphic, relatedGraphics, config } = this.params;
    const { mode, type = 'fadeIn' } = config;

    const target = this.target;

    let startTime = 0;

    if (mode === 'after') {
      relatedGraphic.animates &&
        relatedGraphic.animates.forEach((animate: any) => {
          startTime = Math.max(startTime, animate.getStartTime() + animate.getTotalDuration());
        });
    } else if (mode === 'after-all') {
      relatedGraphics &&
        relatedGraphics.forEach((graphic: any) => {
          graphic.animates &&
            graphic.animates.forEach((animate: any) => {
              startTime = Math.max(startTime, animate.getStartTime() + animate.getTotalDuration());
            });
        });
    } else {
      // 'same-time'
      relatedGraphic.animates &&
        relatedGraphic.animates.forEach((animate: any) => {
          startTime = Math.max(startTime, animate.getStartTime());
        });
    }

    animator.animate(target, {
      ...config,
      duration,
      easing,
      startTime,
      type
    });

    this.completeBind(animator);
  }

  // 标签动画本身没有逻辑，具体通过animator中执行，所以本身不需要屏蔽冲突
  protected tryPreventConflict(): void {
    return;
  }
}

export function registerLabelAnimate() {
  AnimateExecutor.registerBuiltInAnimate('increaseCount', IncreaseCount);
  // Label update animation
  AnimateExecutor.registerBuiltInAnimate('labelUpdate', LabelUpdate);
  AnimateExecutor.registerBuiltInAnimate('labelEnter', LabelEnter);
}
