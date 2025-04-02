import { AComponentAnimate } from './custom-animate';
import { createComponentAnimator } from '../component';

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
  }
}
