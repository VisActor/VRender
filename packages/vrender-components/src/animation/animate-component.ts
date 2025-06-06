import type { EasingType } from '@visactor/vrender-core';
import { AbstractComponent } from '../core/base';
import { isArray, isObject, merge } from '@visactor/vutils';

interface AnimateComponentAttribute {
  animation?: boolean | any;
  animationEnter?: boolean | any;
  animationExit?: boolean | any;
  animationUpdate?: boolean | any;
}

/**
 * 标签的离场动画配置
 */
export interface ICommonAnimation {
  /**
   * 动画执行的时长
   */
  duration?: number;
  /**
   * 动画延迟的时长
   */
  delay?: number;
  /**
   * 动画的缓动函数
   */
  easing?: EasingType;
}

export abstract class AnimateComponent<T extends AnimateComponentAttribute> extends AbstractComponent<T> {
  // parsed animation config
  protected _animationConfig?: {
    enter: ICommonAnimation | false;
    exit: ICommonAnimation | false;
    update: ICommonAnimation | false;
  };

  _prepareAnimate(defaultAnimation: ICommonAnimation) {
    if (this.attribute.animation !== false) {
      const { animation, animationEnter, animationExit, animationUpdate } = this.attribute;
      const animationCfg = isObject(animation) ? animation : {};
      this._animationConfig = {
        enter: animationEnter !== false ? merge({}, defaultAnimation, animationCfg, animationEnter ?? {}) : false,
        exit: animationExit !== false ? merge({}, defaultAnimation, animationCfg, animationExit ?? {}) : false,
        update:
          animationUpdate !== false
            ? isArray(animationUpdate)
              ? animationUpdate
              : merge({}, defaultAnimation, animationCfg, animationUpdate ?? {})
            : false
      };
    } else {
      this._animationConfig = {
        enter: false,
        exit: false,
        update: false
      };
    }
  }
}
