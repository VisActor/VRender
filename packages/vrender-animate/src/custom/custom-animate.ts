import type { ICustomAnimate } from '../intreface/animate';
import type { EasingType } from '../intreface/easing';
import type { IAnimateStepType } from '../intreface/type';
import { Step } from '../step';

export abstract class ACustomAnimate<T> extends Step implements ICustomAnimate {
  type: IAnimateStepType = 'customAnimate';
  declare customFrom: T;
  declare params?: any;
  declare props?: T;

  // 为了兼容旧的api，from和to是可选的，且尽量不需要From，因为为了避免突变，From都应该从当前位置开始
  // 所以From并不会真正设置到fromProps中，而是作为customFrom参数
  constructor(customFrom: T, customTo: T, duration: number, easing: EasingType, params?: any) {
    super('customAnimate', customTo, duration, easing);
    this.customFrom = customFrom;
    this.params = params;
  }

  get from() {
    return this.getFromProps();
  }

  get to() {
    return this.getEndProps();
  }

  update(end: boolean, ratio: number, out: Record<string, any>): void {
    // TODO 需要修复，只有在开始的时候才调用
    this.onStart();
    if (!this.props || !this.propKeys) {
      return;
    }
    // 应用缓动函数
    const easedRatio = this.easing(ratio);
    this.onUpdate(end, easedRatio, out);
  }

  protected setProps(props: T) {
    this.props = props;
    this.propKeys = Object.keys(props);
    this.animate.reSyncProps();
  }
}
