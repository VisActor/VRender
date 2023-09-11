import { injectable } from 'inversify';
import type { IContext2d, EnvType } from '../../../interface';
import { FeishuContext2d } from '../feishu';

@injectable()
export class TTContext2d extends FeishuContext2d implements IContext2d {
  static env: EnvType = 'tt';
}
