import { AComponentAnimate } from './custom-animate';
import { createComponentAnimator } from '../component';
import { InputText } from './input-text';

/**
 * LabelItemAppear class handles the appear animation for StoryLabelItem components
 */
export class LabelItemAppear extends AComponentAnimate<any> {
  onBind(): void {
    super.onBind();
    const animator = createComponentAnimator(this.target);
    this._animator = animator;
    const duration = this.duration;
    const easing = this.easing;
    const target = this.target as any;

    const { symbolStartOuterType = 'scale', titleType = 'typewriter', titlePanelType = 'scale' } = this.params;

    const symbolTime = duration / 10;
    target._symbolStart.setAttributes({ scaleX: 0, scaleY: 0 });

    animator.animate(target._symbolStart, {
      type: 'to',
      to: { scaleX: 1, scaleY: 1 },
      duration: symbolTime * 5,
      easing
    });

    let symbolStartOuterFrom: any;
    let symbolStartOuterTo: any;
    if (symbolStartOuterType === 'scale') {
      symbolStartOuterFrom = { scaleX: 0, scaleY: 0 };
      symbolStartOuterTo = { scaleX: 1, scaleY: 1 };
    } else {
      symbolStartOuterFrom = { clipRange: 0 };
      symbolStartOuterTo = { clipRange: 1 };
    }
    target._symbolStartOuter.setAttributes(symbolStartOuterFrom);

    animator.animate(target._symbolStartOuter, {
      type: 'to',
      to: symbolStartOuterTo,
      duration: symbolTime * 5,
      easing
    });

    target._symbolEnd.setAttributes({ scaleX: 0, scaleY: 0 });

    animator.animate(target._symbolEnd, {
      type: 'to',
      to: { scaleX: 1, scaleY: 1 },
      duration: symbolTime * 2,
      delay: symbolTime * 8,
      easing
    });

    target._line.setAttributes({ clipRange: 0 });

    animator.animate(target._line, {
      type: 'to',
      to: { clipRange: 1 },
      duration: symbolTime * 9,
      easing
    });

    if (titleType === 'typewriter') {
      const titleTopText = target._titleTop.attribute.text as string;
      target._titleTop.setAttributes({ text: '' });

      animator.animate(target._titleTop, {
        type: 'custom',
        delay: symbolTime * 5,
        duration: symbolTime * 4,
        easing: 'linear',
        to: { text: titleTopText },
        custom: InputText
      });

      const titleBottomText = target._titleBottom.attribute.text as string;
      target._titleBottom.setAttributes({ text: '' });

      animator.animate(target._titleBottom, {
        type: 'custom',
        delay: symbolTime * 5,
        duration: symbolTime * 4,
        easing: 'linear',
        to: { text: titleBottomText },
        custom: InputText
      });
    } else {
      target._titleTop.setAttributes({ dy: target._titleTop.AABBBounds.height() + 10 });

      animator.animate(target._titleTop, {
        type: 'to',
        to: {
          dy: 0
        },
        delay: symbolTime * 5,
        duration: symbolTime * 4,
        easing: 'linear'
      });

      target._titleBottom.setAttributes({ dy: -(10 + target._titleBottom.AABBBounds.height()) });

      animator.animate(target._titleBottom, {
        type: 'to',
        to: {
          dy: 0
        },
        delay: symbolTime * 5,
        duration: symbolTime * 4,
        easing: 'linear'
      });
    }

    if (titlePanelType === 'scale') {
      [target._titleTopPanel, target._titleBottomPanel].forEach(panel => {
        const scaleX = panel.attribute.scaleX ?? 1;
        panel.setAttributes({ scaleX: 0 });
        animator.animate(panel, {
          type: 'to',
          to: {
            scaleX
          },
          duration,
          easing
        });
      });
    } else if (titlePanelType === 'stroke') {
      [target._titleTopPanel, target._titleBottomPanel].forEach(panel => {
        const b = panel.AABBBounds;
        const totalLen = (b.width() + b.height()) * 2;
        panel.setAttributes({ lineDash: [0, totalLen * 10] });
        animator.animate(panel, {
          type: 'to',
          to: {
            lineDash: [totalLen, totalLen * 10]
          },
          duration,
          easing
        });
      });
    }

    this.completeBind(animator);
  }
}

/**
 * LabelItemDisappear class handles the disappear animation for StoryLabelItem components
 */
export class LabelItemDisappear extends AComponentAnimate<any> {
  onBind(): void {
    super.onBind();
    const animator = createComponentAnimator(this.target);
    this._animator = animator;

    const duration = this.duration;
    const easing = this.easing;
    const target = this.target as any;

    const { mode } = this.params;

    if (mode === 'scale') {
      animator.animate(target._symbolStart, {
        type: 'to',
        to: { scaleX: 0, scaleY: 0 },
        duration,
        easing
      });
    } else {
      animator.animate(target._line, {
        type: 'to',
        to: { clipRange: 0 },
        duration,
        easing
      });

      animator.animate(target._symbolStart, {
        type: 'to',
        to: { scaleX: 0, scaleY: 0 },
        duration: duration / 2,
        delay: duration / 2,
        easing
      });

      animator.animate(target._symbolEnd, {
        type: 'to',
        to: { scaleX: 0, scaleY: 0 },
        duration,
        easing
      });

      animator.animate(target._titleTop, {
        type: 'to',
        to: { dy: target._titleTop.AABBBounds.height() + 10 },
        duration: duration / 2,
        easing
      });

      animator.animate(target._titleBottom, {
        type: 'to',
        to: { dy: -(10 + target._titleBottom.AABBBounds.height()) },
        duration: duration / 2,
        easing
      });

      animator.animate(target._symbolStartOuter, {
        type: 'to',
        to: { clipRange: 0 },
        duration: duration / 2,
        delay: duration / 2,
        easing
      });

      animator.animate(target._titleTopPanel, {
        type: 'to',
        to: { scaleX: 0 },
        duration,
        easing
      });

      animator.animate(target._titleBottomPanel, {
        type: 'to',
        to: { scaleX: 0 },
        duration,
        easing
      });
    }

    this.completeBind(animator);
  }
}
