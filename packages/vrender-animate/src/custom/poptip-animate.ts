import { AComponentAnimate } from './custom-animate';
import { createComponentAnimator } from '../component';
import { InputText } from './input-text';

/**
 * PoptipAppear class handles the appear animation for Poptip components
 */
export class PoptipAppear extends AComponentAnimate<any> {
  onBind(): void {
    const animator = createComponentAnimator(this.target);
    this._animator = animator;

    const duration = this.duration;
    const easing = this.easing;
    const target = this.target as any;

    const { wave } = this.params;

    target.setAttributes({ scaleX: 0, scaleY: 0 });

    animator.animate(target, {
      type: 'to',
      to: { scaleX: 1, scaleY: 1 },
      duration: (duration / 3) * 2,
      easing
    });

    target.titleShape &&
      animator.animate(target.titleShape, {
        type: 'custom',
        to: { text: target.titleShape.attribute.text as string },
        duration,
        easing,
        custom: InputText
      });

    target.contentShape &&
      animator.animate(target.contentShape, {
        type: 'custom',
        to: { text: target.contentShape.attribute.text as string },
        duration,
        easing,
        custom: InputText
      });

    if (wave) {
      const dur = duration / 6;
      animator.animate(target.group, {
        timeSlices: [
          {
            duration: dur,
            effects: {
              type: 'to',
              to: { angle: wave },
              easing
            }
          },
          {
            duration: dur * 2,
            effects: {
              type: 'to',
              to: { angle: -wave },
              easing
            }
          },
          {
            duration: dur * 2,
            effects: {
              type: 'to',
              to: { angle: wave },
              easing
            }
          },
          {
            duration: dur,
            effects: {
              type: 'to',
              to: { angle: 0 },
              easing
            }
          }
        ]
      });
    }

    this.completeBind(animator);
  }
}

/**
 * PoptipDisappear class handles the disappear animation for Poptip components
 */
export class PoptipDisappear extends AComponentAnimate<any> {
  onBind(): void {
    const animator = createComponentAnimator(this.target);
    this._animator = animator;

    const duration = this.duration;
    const easing = this.easing;
    const target = this.target as any;

    animator.animate(target, {
      type: 'to',
      to: { scaleX: 0, scaleY: 0 },
      duration,
      easing
    });

    this.completeBind(animator);
  }
}
