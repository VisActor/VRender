// 参考konva
import { injectable } from 'inversify';
import { IContext2d, EnvType } from '../../../interface';
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
