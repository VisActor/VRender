import { injectable } from '@visactor/vrender-core';
import type { IContext2d, EnvType } from '@visactor/vrender-core';
import { FeishuContext2d } from '../feishu';

@injectable()
export class TTContext2d extends FeishuContext2d implements IContext2d {
  static env: EnvType = 'tt';
}
