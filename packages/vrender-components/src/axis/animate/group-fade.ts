/**
 * TODO: 待 vrender 修复后可删除
 */
import { ACustomAnimate, EasingType, IGroup } from '@visactor/vrender';

export class GroupFadeIn extends ACustomAnimate<any> {
  declare target: IGroup;

  constructor(from: any, to: any, duration: number, easing: EasingType) {
    super(null, null, duration, easing);
  }

  getEndProps(): Record<string, any> {
    return {};
  }

  onBind(): void {
    this.target.setTheme({
      common: {
        opacity: 0
      }
    });
    return;
  }

  onEnd(): void {
    this.target.setTheme({
      common: {
        opacity: 1
      }
    });
    return;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    this.target.setTheme({
      common: {
        opacity: ratio
      }
    });
  }
}

export class GroupFadeOut extends ACustomAnimate<any> {
  declare target: IGroup;

  constructor(from: any, to: any, duration: number, easing: EasingType) {
    super(null, null, duration, easing);
  }

  getEndProps(): Record<string, any> {
    return {};
  }

  onBind(): void {
    this.target.setTheme({
      common: {
        opacity: 1
      }
    });
    return;
  }

  onEnd(): void {
    this.target.setTheme({
      common: {
        opacity: 0
      }
    });
    return;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    this.target.setTheme({
      common: {
        opacity: 1 - ratio
      }
    });
  }
}
