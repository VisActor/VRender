// 参考konva
import { injectable } from 'inversify';
import type { IContext2d, EnvType } from '../../../interface';
import { BrowserContext2d } from '../browser';

@injectable()
export class WxContext2d extends BrowserContext2d implements IContext2d {
  static env: EnvType = 'wx';

  draw() {
    return;
  }
}
