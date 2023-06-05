import type { IPointLike } from '@visactor/vutils';
import type { IGraphicAttribute, IGraphic } from '../graphic';

export type IPolygonAttribute = {
  // ? 不需要x2/y2
  points: IPointLike[];
  borderRadius?: number | number[];
};

export type IPolygonGraphicAttribute = Partial<IGraphicAttribute> & Partial<IPolygonAttribute>;

export type IPolygon = IGraphic<IPolygonGraphicAttribute>;
