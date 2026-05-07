import { pi, pi2 } from '@visactor/vutils';
import { ACustomAnimate } from './custom-animate';
import { applyAnimationFrameAttributes } from './transient';

type RotateSphereParams =
  | {
      center: { x: number; y: number; z: number };
      r: number;
      cb?: (out: any) => void;
    }
  | (() => any);

export class RotateBySphereAnimate extends ACustomAnimate<any> {
  declare params: RotateSphereParams;
  declare theta: number;
  declare phi: number;

  onBind(): void {
    super.onBind();

    // const to: Record<string, number> = {};
    // const from: Record<string, number> = this.from ?? {};

    // 用于入场的时候设置属性（因为有动画的时候VChart不会再设置属性了）

    // this.props = to;
    this.propKeys = ['x', 'y', 'z', 'alpha', 'zIndex'];
    // this.from = from;
    // this.to = to;
  }

  onFirstRun(): void {
    super.onFirstRun();
    (this.target as any).applyFinalAttributeToAttribute?.();
  }

  onStart(): void {
    super.onStart();
    const { center, r } = typeof this.params === 'function' ? this.params() : this.params;
    const source = (this.target as any).finalAttribute ?? this.target.attribute;
    const startX = source.x;
    const startY = source.y;
    const startZ = source.z ?? 0;
    const phi = Math.acos((startY - center.y) / r);
    let theta = Math.acos((startX - center.x) / r / Math.sin(phi));
    if (startZ - center.z < 0) {
      theta = pi2 - theta;
    }
    this.theta = theta;
    this.phi = phi;
  }

  onEnd() {
    return;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (this.phi == null || this.theta == null) {
      return;
    }
    const { center, r, cb } = typeof this.params === 'function' ? this.params() : this.params;
    const deltaAngle = Math.PI * 2 * ratio;
    const theta = this.theta + deltaAngle;
    const phi = this.phi;
    const x = r * Math.sin(phi) * Math.cos(theta) + center.x;
    const y = r * Math.cos(phi) + center.y;
    const z = r * Math.sin(phi) * Math.sin(theta) + center.z;
    let alpha = theta + pi / 2;
    // out.beta = phi;
    while (alpha > pi2) {
      alpha -= pi2;
    }
    alpha = pi2 - alpha;

    applyAnimationFrameAttributes(this.target, {
      x,
      y,
      z,
      alpha,
      zIndex: z * -10000
    });
    this.target.addUpdatePositionTag();
    this.target.addUpdateShapeAndBoundsTag();
    cb && cb(out);
  }
}
