import type { EasingType, IAnimate, IStep } from '@visactor/vrender-core';
import { ACustomAnimate } from './custom-animate';
import { applyAnimationFrameAttributes, applyAppearStartAttributes } from './transient';

export interface IScaleAnimationOptions {
  direction?: 'x' | 'y' | 'xy';
  fromScale?: number;
  fromScaleX?: number;
  fromScaleY?: number;
  options?: Pick<IScaleAnimationOptions, 'direction' | 'fromScale' | 'fromScaleX' | 'fromScaleY'>;
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
    const options = this.params?.options;
    const direction = this.params?.direction ?? options?.direction;
    const fromScaleX = this.params?.fromScaleX ?? options?.fromScaleX ?? this.params?.fromScale ?? options?.fromScale;
    const fromScaleY = this.params?.fromScaleY ?? options?.fromScaleY ?? this.params?.fromScale ?? options?.fromScale;

    switch (direction) {
      case 'x':
        from = { scaleX: fromScaleX ?? fromAttrs.scaleX ?? 0 };
        to = { scaleX: attrs?.scaleX ?? 1 };
        this._updateFunction = this.updateX;
        break;
      case 'y':
        from = { scaleY: fromScaleY ?? fromAttrs.scaleY ?? 0 };
        to = { scaleY: attrs?.scaleY ?? 1 };
        this._updateFunction = this.updateY;
        break;
      case 'xy':
      default:
        from = {
          scaleX: fromScaleX ?? fromAttrs.scaleX ?? 0,
          scaleY: fromScaleY ?? fromAttrs.scaleY ?? 0
        };
        to = {
          scaleX: attrs?.scaleX ?? 1,
          scaleY: attrs?.scaleY ?? 1
        };
        this._updateFunction = this.updateXY;
    }

    // 用于入场的时候设置属性（因为有动画的时候VChart不会再设置属性了）
    (this.target as any).applyFinalAttributeToAttribute?.();

    this.props = to;
    this.from = from;
    this.to = to;
    if (this.params.controlOptions?.immediatelyApply !== false) {
      applyAppearStartAttributes(this.target, from);
    }
  }

  onEnd(cb?: (animate: IAnimate, step: IStep) => void): void {
    super.onEnd(cb);
  }

  updateX(ratio: number): void {
    this.applyScaleTransientAttrs(ratio, true, false);
  }

  updateY(ratio: number): void {
    this.applyScaleTransientAttrs(ratio, false, true);
  }

  updateXY(ratio: number): void {
    this.applyScaleTransientAttrs(ratio, true, true);
  }

  private applyScaleTransientAttrs(ratio: number, scaleX: boolean, scaleY: boolean): void {
    const attrs: Record<string, number> = {};
    if (scaleX) {
      attrs.scaleX = this.from.scaleX + (this.to.scaleX - this.from.scaleX) * ratio;
    }
    if (scaleY) {
      attrs.scaleY = this.from.scaleY + (this.to.scaleY - this.from.scaleY) * ratio;
    }
    applyAnimationFrameAttributes(this.target, attrs);
  }

  /**
   * 删除自身属性，会直接从props等内容里删除掉
   */
  deleteSelfAttr(key: string): void {
    this.deleteSelfAttrs([key]);
  }

  deleteSelfAttrs(keys: string[]): void {
    super.deleteSelfAttrs(keys);
    const firstKey = this.propKeys?.[0];
    if (this.propKeys && this.propKeys.length > 1) {
      this._updateFunction = this.updateXY;
    } else if (firstKey === 'scaleX') {
      this._updateFunction = this.updateX;
    } else if (firstKey === 'scaleY') {
      this._updateFunction = this.updateY;
    } else {
      this._updateFunction = null;
    }
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (this._updateFunction) {
      this._updateFunction(ratio);
      this.target.addUpdatePositionTag();
      this.target.addUpdateBoundTag();
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
    const attrs: Record<string, any> = {};
    this.propKeys.forEach(key => {
      attrs[key] = this.from[key] + (this.to[key] - this.from[key]) * ratio;
    });
    applyAnimationFrameAttributes(this.target, attrs);
    this.target.addUpdatePositionTag();
    this.target.addUpdateBoundTag();
  }
}
