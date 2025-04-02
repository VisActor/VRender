import type { IAnimate, IStep } from '../intreface/animate';
import type { EasingType } from '../intreface/easing';
import { ACustomAnimate } from './custom-animate';

export interface IScaleAnimationOptions {
  direction?: 'x' | 'y' | 'xy';
}

export class ScaleIn extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IScaleAnimationOptions) {
    super(from, to, duration, easing, params);
  }

  declare _updateFunction: (ratio: number) => void;

  onBind(): void {
    // 用于入场的时候设置属性（因为有动画的时候VChart不会再设置属性了）
    if (this.params?.diffAttrs) {
      Object.assign(this.target.attribute, this.params.diffAttrs);
    }
    let from: Record<string, number>;
    let to: Record<string, number>;
    const attrs = this.target.getFinalAttribute();
    const fromAttrs = this.target.context?.lastAttrs ?? {};

    switch (this.params?.direction) {
      case 'x':
        from = { scaleX: fromAttrs.scaleX ?? 0 };
        to = { scaleX: attrs?.scaleX ?? 1 };
        this.propKeys = ['scaleX'];
        this._updateFunction = this.updateX;
        break;
      case 'y':
        from = { scaleY: fromAttrs.scaleY ?? 0 };
        to = { scaleY: attrs?.scaleY ?? 1 };
        this.propKeys = ['scaleY'];
        this._updateFunction = this.updateY;
        break;
      case 'xy':
      default:
        from = { scaleX: fromAttrs.scaleX ?? 0, scaleY: fromAttrs.scaleY ?? 0 };
        to = {
          scaleX: attrs?.scaleX ?? 1,
          scaleY: attrs?.scaleY ?? 1
        };
        this.propKeys = ['scaleX', 'scaleY'];
        this._updateFunction = this.updateXY;
    }

    this.props = to;
    // 性能消耗，不用reSyncProps
    // this.animate.reSyncProps();
    this.from = from;
    this.to = to;
    // 性能优化，不需要setAttributes
    Object.assign(this.target.attribute, from);
    this.target.addUpdatePositionTag();
    this.target.addUpdateBoundTag();
  }

  onEnd(cb?: (animate: IAnimate, step: IStep) => void): void {
    super.onEnd(cb);
  }

  updateX(ratio: number): void {
    this.target.attribute.scaleX = this.from.scaleX + (this.to.scaleX - this.from.scaleX) * ratio;
  }

  updateY(ratio: number): void {
    this.target.attribute.scaleY = this.from.scaleY + (this.to.scaleY - this.from.scaleY) * ratio;
  }

  updateXY(ratio: number): void {
    this.updateX(ratio);
    this.updateY(ratio);
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    this._updateFunction(ratio);
    this.target.addUpdatePositionTag();
  }
}

export class ScaleOut extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IScaleAnimationOptions) {
    super(from, to, duration, easing, params);
  }

  onBind(): void {
    let from: Record<string, number>;
    let to: Record<string, number>;
    // 获取当前的数据
    const attrs = this.target.getFinalAttribute();
    switch (this.params?.direction) {
      case 'x':
        from = { scaleX: attrs?.scaleX ?? 1 };
        to = { scaleX: 0 };
        break;
      case 'y':
        from = { scaleY: attrs?.scaleY ?? 1 };
        to = { scaleY: 0 };
        break;
      case 'xy':
      default:
        from = { scaleX: attrs?.scaleX ?? 1, scaleY: attrs?.scaleY ?? 1 };
        to = {
          scaleX: 0,
          scaleY: 0
        };
    }
    this.props = to;
    this.propKeys = Object.keys(to);
    this.animate.reSyncProps();
    this.from = from;
    this.to = to;
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
  }
}
