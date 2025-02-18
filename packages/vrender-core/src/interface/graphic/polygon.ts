import type { IPointLike } from '@visactor/vutils';
import type { IGraphicAttribute, IGraphic } from '../graphic';

export type IPolygonAttribute = {
  /**
   * 多边形的顶点坐标
   */
  points: IPointLike[];
  /**
   * 圆角半径
   */
  cornerRadius?: number | number[];
  /**
   * 是否闭合多边形
   */
  closePath?: boolean;
};

export type IPolygonGraphicAttribute = Partial<IGraphicAttribute> & Partial<IPolygonAttribute>;

export type IPolygon = IGraphic<IPolygonGraphicAttribute>;
