// 参考konva
import { injectable } from 'inversify';
import type { IContext2d, EnvType } from '../../../interface';
import { BrowserContext2d } from '../browser';

@injectable()
export class LynxContext2d extends BrowserContext2d implements IContext2d {
  static env: EnvType = 'lynx';

  declare drawPromise?: Promise<any>;

  declare _globalAlpha: number;

  get globalAlpha(): number {
    return this._globalAlpha;
  }
  set globalAlpha(ga: number) {
    this.nativeContext.globalAlpha = ga;
    this._globalAlpha = ga;
  }

  setLineDash(segments: number[]) {
    const a = arguments;
    const _context = this.nativeContext;

    if (!!this.nativeContext.setLineDash) {
      const lineDash = a[0];
      // lynx环境中lineDash不能为[0, 0]
      if (lineDash[0] === 0 && lineDash[1] === 0) {
        return;
      }
      _context.setLineDash();
    }
  }

  draw() {
    const _context = this.nativeContext as any;
    this.drawPromise = new Promise(resolve => {
      _context.draw(true, () => {
        this.drawPromise = null;
        resolve(null);
      });
    });
  }
}
