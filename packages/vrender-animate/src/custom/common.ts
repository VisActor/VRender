import type { IAnimate, IStep } from '../intreface/animate';
import type { EasingType } from '../intreface/easing';
import { ACustomAnimate } from './custom-animate';

export interface IScaleAnimationOptions {
  direction?: 'x' | 'y' | 'xy';
}

export class CommonIn extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  keys: string[];

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IScaleAnimationOptions) {
    super(from, to, duration, easing, params);
  }

  onBind(): void {
    // 用于入场的时候设置属性（因为有动画的时候VChart不会再设置属性了）
    if (this.params?.diffAttrs) {
      this.target.setAttributes(this.params.diffAttrs);
    }
    const attrs = (this.target as any).getAttributes(true);
    const fromAttrs = this.target.context?.lastAttrs ?? {};

    const to: Record<string, number> = {};
    const from: Record<string, number> = {};
    this.keys.forEach(key => {
      to[key] = attrs?.[key] ?? 1;
      from[key] = fromAttrs?.[key] ?? 0;
    });

    this.props = to;
    this.propKeys = this.keys;
    this.animate.reSyncProps();
    this.from = from;
    this.to = to;
    this.target.setAttributes(from as any);
  }

  onEnd(cb?: (animate: IAnimate, step: IStep) => void): void {
    super.onEnd(cb);
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    const attribute: Record<string, any> = this.target.attribute;
    this.propKeys.forEach(key => {
      attribute[key] = this.from[key] + (this.to[key] - this.from[key]) * ratio;
    });
    this.target.addUpdatePositionTag();
    this.target.addUpdateShapeAndBoundsTag();
  }
}

export class CommonOut extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  keys: string[];

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IScaleAnimationOptions) {
    super(from, to, duration, easing, params);
  }

  onBind(): void {
    const attrs = this.target.getFinalAttribute();

    const to: Record<string, number> = {};
    const from: Record<string, number> = {};
    this.keys.forEach(key => {
      to[key] = 0;
      from[key] = attrs?.[key] ?? 1;
    });

    this.props = to;
    this.propKeys = this.keys;
    this.animate.reSyncProps();
    this.from = from;
    this.to = to;
    this.target.setAttributes(from as any);
  }

  onEnd(cb?: (animate: IAnimate, step: IStep) => void): void {
    super.onEnd(cb);
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    const attribute: Record<string, any> = this.target.attribute;
    this.propKeys.forEach(key => {
      attribute[key] = this.from[key] + (this.to[key] - this.from[key]) * ratio;
    });
    this.target.addUpdatePositionTag();
    this.target.addUpdateShapeAndBoundsTag();
  }
}
