import { AComponentAnimate, AnimateExecutor, createComponentAnimator } from '@visactor/vrender-animate';

/**
 * LabelUpdate class handles the update animation for Label components
 */
export class LabelUpdate extends AComponentAnimate<any> {
  onBind(): void {
    const animator = createComponentAnimator(this.target);
    this._animator = animator;
    const duration = this.duration;
    const easing = this.easing;

    const { prevText, curText, prevLabelLine, curLabelLine } = this.params;
    const diff: Record<string, any> = {};

    for (const key in curText.attribute) {
      if (prevText.attribute[key] !== curText.attribute[key]) {
        diff[key] = curText.attribute[key];
      }
    }

    const { text, ...rest } = diff;

    animator.animate(prevText, {
      type: 'to',
      to: rest,
      duration,
      easing
    });

    animator.animate(prevText, {
      type: 'increaseCount',
      to: {
        text: curText.attribute.text
      },
      duration,
      easing
    });

    if (prevLabelLine) {
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
  // Label update animation
  AnimateExecutor.registerBuiltInAnimate('labelUpdate', LabelUpdate);
  AnimateExecutor.registerBuiltInAnimate('labelEnter', LabelEnter);
}
