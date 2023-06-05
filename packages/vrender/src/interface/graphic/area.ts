import type { IPointLike } from '@visactor/vutils';
import type { ISegPath2D } from '../../common';
import type { IGraphic, IFillStyle, IGraphicAttribute } from '../graphic';
import type { ICurveType } from '../common';

export type IAreaAttribute = {
  segments: IAreaSegment[]; // 分段设置point和样式
  points: IPointLike[];
  curveType: ICurveType;
  clipRange: number;
};

export type IAreaCacheItem = {
  top: ISegPath2D;
  bottom: ISegPath2D;
};

export type IAreaGraphicAttribute = Partial<IGraphicAttribute> & Partial<IAreaAttribute>;

export interface IArea extends IGraphic<IAreaGraphicAttribute> {
  cacheArea?: IAreaCacheItem | IAreaCacheItem[];
}

type ISegmentStyle = Pick<
  IGraphicAttribute,
  'fillColor' | 'fillOpacity' | 'background' | 'texture' | 'textureColor' | 'textureSize' | 'texturePadding'
>;

export interface IAreaSegment extends Partial<ISegmentStyle> {
  points: IPointLike[];
}
