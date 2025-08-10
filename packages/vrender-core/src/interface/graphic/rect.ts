import type { IGraphicAttribute, IGraphic } from '../graphic';
import type { ICustomPath2D } from '../path';

export type IRectAttribute = {
  width: number;
  height: number;
  x1: number;
  y1: number;
  /**
   * 圆角半径
   */
  cornerRadius: number | number[];
  /**
   * 圆角类型，
   * 'round' - 圆弧
   * 'bevel' - 斜角
   */
  cornerType: 'round' | 'bevel';
  /**
   * 当宽高为0时，是否绘制边框
   */
  drawStrokeWhenZeroWH: boolean;
};

export type IRectGraphicAttribute = Partial<IGraphicAttribute> & Partial<IRectAttribute>;

export interface IRect extends IGraphic<IRectGraphicAttribute> {
  cache?: ICustomPath2D;
}
