import { injectable } from 'inversify';
import type { IGraphic, IGraphicRender, IRenderService } from '../../../interface';

@injectable()
export abstract class AbstractGraphicRender implements IGraphicRender {
  type: string; // 图元类型
  numberType: number;

  abstract draw(graphic: IGraphic, renderService: IRenderService): void;
}
