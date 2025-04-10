import type { EasingType, IAnimate, IStep } from '@visactor/vrender-core';
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
    super.onBind();
    let from: Record<string, number>;
    let to: Record<string, number>;
    const attrs = this.target.getFinalAttribute();
    const fromAttrs = this.target.attribute ?? {};

    switch (this.params?.direction) {
      case 'x':
        from = { scaleX: fromAttrs.scaleX ?? 0 };
        to = { scaleX: attrs?.scaleX ?? 1 };
        this._updateFunction = this.updateX;
        break;
      case 'y':
        from = { scaleY: fromAttrs.scaleY ?? 0 };
        to = { scaleY: attrs?.scaleY ?? 1 };
        this._updateFunction = this.updateY;
        break;
      case 'xy':
      default:
        from = { scaleX: fromAttrs.scaleX ?? 0, scaleY: fromAttrs.scaleY ?? 0 };
        to = {
          scaleX: attrs?.scaleX ?? 1,
          scaleY: attrs?.scaleY ?? 1
        };
        this._updateFunction = this.updateXY;
    }

    // 用于入场的时候设置属性（因为有动画的时候VChart不会再设置属性了）
    const finalAttribute = this.target.getFinalAttribute();
    if (finalAttribute) {
      Object.assign(this.target.attribute, finalAttribute);
    }

    this.props = to;
    this.from = from;
    this.to = to;
    // 调用次数不多，可以setAttributes
    this.target.setAttributes(from);
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

  /**
   * 删除自身属性，会直接从props等内容里删除掉
   */
  deleteSelfAttr(key: string): void {
    delete this.props[key];
    // fromProps在动画开始时才会计算，这时可能不在
    this.fromProps && delete this.fromProps[key];
    const index = this.propKeys.indexOf(key);
    if (index !== -1) {
      this.propKeys.splice(index, 1);
    }

    if (this.propKeys && this.propKeys.length > 1) {
      this._updateFunction = this.updateXY;
    } else if (this.propKeys[0] === 'scaleX') {
      this._updateFunction = this.updateX;
    } else if (this.propKeys[0] === 'scaleY') {
      this._updateFunction = this.updateY;
    } else {
      this._updateFunction = null;
    }
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (this._updateFunction) {
      this._updateFunction(ratio);
      this.target.addUpdatePositionTag();
    }
  }
}

export class ScaleOut extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IScaleAnimationOptions) {
    super(from, to, duration, easing, params);
  }

  onBind(): void {
    super.onBind();
    let from: Record<string, number>;
    let to: Record<string, number>;
    // 获取当前的数据
    const attrs = this.target.attribute;
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
