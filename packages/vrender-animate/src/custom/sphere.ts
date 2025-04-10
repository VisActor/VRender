import { pi, pi2 } from '@visactor/vutils';
import { ACustomAnimate } from './custom-animate';

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

  onStart(): void {
    const { center, r } = typeof this.params === 'function' ? this.params() : this.params;
    const startX = this.target.getComputedAttribute('x');
    const startY = this.target.getComputedAttribute('y');
    const startZ = this.target.getComputedAttribute('z');
    const phi = Math.acos((startY - center.y) / r);
    let theta = Math.acos((startX - center.x) / r / Math.sin(phi));
    if (startZ - center.z < 0) {
      theta = pi2 - theta;
    }
    this.theta = theta;
    this.phi = phi;
  }

  onBind() {
    super.onBind();
    return;
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
    out.x = x;
    out.y = y;
    out.z = z;
    // out.beta = phi;
    out.alpha = theta + pi / 2;
    while (out.alpha > pi2) {
      out.alpha -= pi2;
    }
    out.alpha = pi2 - out.alpha;

    out.zIndex = out.z * -10000;

    cb && cb(out);
  }
}
