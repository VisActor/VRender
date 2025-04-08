import { AComponentAnimate, AnimateExecutor, createComponentAnimator } from '@visactor/vrender-animate';

/**
 * AxisEnter class handles the enter animation for Axis components
 */
export class AxisEnter extends AComponentAnimate<any> {
  onBind(): void {
    const animator = createComponentAnimator(this.target);
    this._animator = animator;
    const duration = this.duration;
    const easing = this.easing;
    const { config, lastScale, getTickCoord } = this.params;

    let ratio = 1;

    if (lastScale && getTickCoord) {
      ratio = 0.7;
      const currData = this.target.data;

      const oldValue = lastScale.scale(currData.rawValue);
      const point = getTickCoord(oldValue);
      const newX = this.target.attribute.x;
      const newY = this.target.attribute.y;

      this.target.setAttributes({ x: point.x, y: point.y });
      animator.animate(this.target, {
        type: 'to',
        to: { x: newX, y: newY },
        duration,
        easing
      });
    }

    // if (updateEls && updateEls.length > 1) {
    //   ratio = 0.5;
    //   const oldData1 = updateEls[0].oldEl.data;
    //   const { rawValue: oldRawValue1, value: oldValue1 } = oldData1;
    //   const oldData2 = updateEls[1].oldEl.data;
    //   const { rawValue: oldRawValue2, value: oldValue2 } = oldData2;
    //   const data = this.target.data;
    //   const { rawValue: newRawValue } = data;
    //   // rawValue 是原始值，value是映射出来的值，假设是线性映射，计算一下newRawValue在old阶段的value是什么值
    //   const oldValue =
    //     oldValue1 + ((oldValue2 - oldValue1) * (newRawValue - oldRawValue1)) / (oldRawValue2 - oldRawValue1);
    //   // 将 x 和 y 做映射
    //   const oldX1 = updateEls[0].oldEl.attribute.x;
    //   const oldY1 = updateEls[0].oldEl.attribute.y;
    //   const oldX2 = updateEls[1].oldEl.attribute.x;
    //   const oldY2 = updateEls[1].oldEl.attribute.y;
    //   const oldX = oldX1 + ((oldX2 - oldX1) * (oldValue - oldValue1)) / (oldValue2 - oldValue1);
    //   const oldY = oldY1 + ((oldY2 - oldY1) * (oldValue - oldValue1)) / (oldValue2 - oldValue1);
    //   const newX = this.target.attribute.x;
    //   const newY = this.target.attribute.y;

    //   this.target.setAttributes({ x: oldX, y: oldY });
    //   animator.animate(this.target, {
    //     type: 'to',
    //     to: { x: newX, y: newY },
    //     duration,
    //     easing
    //   });
    // }

    animator.animate(this.target, {
      type: config.type ?? 'fadeIn',
      to: config.to,
      duration: duration * ratio,
      easing
    });
    this.completeBind(animator);
  }
}

/**
 * AxisUpdate class handles the update animation for Axis components
 */
export class AxisUpdate extends AComponentAnimate<any> {
  onBind(): void {
    const animator = createComponentAnimator(this.target);
    this._animator = animator;
    const duration = this.duration;
    const easing = this.easing;
    const { config, diffAttrs } = this.params;
    // this.target.applyAnimationState(
    //   ['update'],
    //   [
    //     {
    //       name: 'update',
    //       animation: {
    //         type: 'to',
    //         to: { ...this.props },
    //         duration,
    //         easing,
    //         customParameters: {
    //           diffAttrs: { ...this.props }
    //         }
    //       }
    //     }
    //   ]
    // );
    // console.log('this.props', this.props, { ...this.target.attribute });
    animator.animate(this.target, {
      type: config.type ?? 'to',
      to: { ...diffAttrs },
      duration,
      easing,
      customParameters: {
        diffAttrs: { ...diffAttrs }
      }
    });
    this.completeBind(animator);
  }

  // 轴动画本身没有逻辑，具体通过animator中执行，所以当需要屏蔽自身属性时，需要通过animator中执行
  deleteSelfAttr(key: string): void {
    super.deleteSelfAttr(key);
    this._animator.deleteSelfAttr(key);
  }

  // 轴动画本身没有逻辑，具体通过animator中执行，所以本身不需要屏蔽冲突
  protected tryPreventConflict(): void {
    return;
  }
}

export function registerAxisAnimate() {
  // Label update animation
  AnimateExecutor.registerBuiltInAnimate('axisEnter', AxisEnter);
  AnimateExecutor.registerBuiltInAnimate('axisUpdate', AxisUpdate);
}
