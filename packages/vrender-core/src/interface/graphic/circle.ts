import type { IGraphicAttribute, IGraphic } from '../graphic';

export type ICircleAttribute = {
  /**
   * 半径
   */
  radius: number;
  /**
   * 起始角度，单位为弧度
   */
  startAngle: number;
  /**
   * 终止角度，单位为弧度
   */
  endAngle: number;
};

export type ICircleGraphicAttribute = Partial<IGraphicAttribute> & Partial<ICircleAttribute>;

export type ICircle = IGraphic<ICircleGraphicAttribute>;
