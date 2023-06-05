import { injectable } from 'inversify';
import {
  IMarkAttribute,
  IContext2d,
  IGraphic,
  IGraphicAttribute,
  IThemeAttribute,
  IFullThemeSpec
} from '../../../interface';
import { IDrawContext, IRenderService } from '../../render-service';

export interface IGraphicRenderDrawParams {
  beforeDrawCb?: () => void;
  afterDrawCb?: () => void;
  drawingCb?: () => void;
  skipDraw?: boolean;
  theme?: IFullThemeSpec;
}

export interface IGraphicRender {
  type: string; // 图元类型
  numberType: number;
  style?: string;
  z?: number;
  draw: (
    graphic: IGraphic,
    renderService: IRenderService,
    drawContext: IDrawContext,
    params?: IGraphicRenderDrawParams
  ) => void;
  drawShape?: (
    graphic: IGraphic,
    ctx: IContext2d,
    x: number,
    y: number,
    drawContext: IDrawContext,
    params?: IGraphicRenderDrawParams,
    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ) => void;
}

@injectable()
export abstract class AbstractGraphicRender implements IGraphicRender {
  type: string; // 图元类型
  numberType: number;

  abstract draw(graphic: IGraphic, renderService: IRenderService): void;
}
