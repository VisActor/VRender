import type { IGroup } from '../interface/graphic/group';
import { ACustomAnimate } from './animate';

export class GroupFadeIn extends ACustomAnimate<any> {
  declare target: IGroup;

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
