import type { CustomPath2D, IGraphic, EasingType } from '@visactor/vrender-core';
import { ACustomAnimate } from './custom-animate';
import { applyAnimationTransientAttributes } from './transient';

export class MotionPath extends ACustomAnimate<any> {
  declare valid: boolean;
  declare pathLength: number;
  declare path: CustomPath2D;
  declare distance: number;
  declare totalLength: number;
  declare initAngle: number;
  declare changeAngle: boolean;
  declare commitOnEnd: boolean;
  declare cb?: (from: any, to: any, ratio: number, target: IGraphic) => void;
  constructor(
    from: any,
    to: any,
    duration: number,
    easing: EasingType,
    params?: {
      path: CustomPath2D;
      distance: number;
      cb?: (from: any, to: any, ratio: number, target: IGraphic) => void;
      initAngle?: number;
      changeAngle?: boolean;
      // Keep the public positional contract: transient frames, endpoint committed by default.
      commitOnEnd?: boolean;
      saveOnEnd?: boolean;
    }
  ) {
    super(from, to, duration, easing, params);
    if (params) {
      this.pathLength = params.path.getLength();
      this.path = params.path;
      this.distance = params.distance;
      this.totalLength = this.distance * this.pathLength;
      this.initAngle = params.initAngle ?? 0;
      this.changeAngle = !!params.changeAngle;
      this.commitOnEnd = params.commitOnEnd ?? params.saveOnEnd ?? true;
      this.cb = params.cb;
    }
  }

  onBind(): void {
    this.from = { x: 0, y: 0 };
    this.to = this.path.getAttrAt(this.totalLength).pos;
    this.props = this.to;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    const attrs = {} as any;
    // 计算位置
    const at = this.totalLength * ratio;
    const { pos, angle } = this.path.getAttrAt(at);
    attrs.x = pos.x;
    attrs.y = pos.y;
    if (this.changeAngle) {
      attrs.angle = angle + this.initAngle;
    }
    this.cb && this.cb(this.from, this.to, ratio, this.target as IGraphic);
    if (end && this.commitOnEnd) {
      this.target.setAttributes(attrs);
      return;
    }
    applyAnimationTransientAttributes(this.target, attrs);
  }
}
