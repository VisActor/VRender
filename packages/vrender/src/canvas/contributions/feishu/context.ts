// 参考konva
import { injectable } from 'inversify';
import { IContext2d, EnvType } from '../../../interface';
import { BrowserContext2d } from '../browser';

declare const tt: {
  canvasGetImageData: (d: any) => any;
};

@injectable()
export class FeishuContext2d extends BrowserContext2d implements IContext2d {
  static env: EnvType = 'feishu';

  declare drawPromise?: Promise<any>;

  _globalAlpha: number;

  // feishu小程序无法正常获取到globalAlpha
  get globalAlpha(): number {
    return this._globalAlpha;
  }
  set globalAlpha(ga: number) {
    this.nativeContext.globalAlpha = ga;
    this._globalAlpha = ga;
  }

  getImageData(sx: number, sy: number, sw: number, sh: number): any {
    return new Promise((resolve, reject) => {
      try {
        tt.canvasGetImageData({
          canvasId: this.canvas.nativeCanvas.id ?? this.canvas.id,
          x: sx,
          y: sy,
          width: sw,
          height: sh,
          success(res: any) {
            resolve(res);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
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
