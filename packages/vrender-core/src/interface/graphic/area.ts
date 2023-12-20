import type { IPointLike } from '@visactor/vutils';
import type { ISegPath2D } from '../curve';
import type { IConnectedStyle, IGraphic, IGraphicAttribute } from '../graphic';
import type { ICurveType } from '../common';

export type IAreaAttribute = {
  segments: IAreaSegment[]; // 分段设置point和样式
  points: IPointLike[];
  curveType: ICurveType;
  clipRange: number;
  closePath: boolean;
};

export type IAreaCacheItem = {
  top: ISegPath2D;
  bottom: ISegPath2D;
};

export type IAreaGraphicAttribute = Partial<IGraphicAttribute> & Partial<IAreaAttribute> & Partial<IConnectedStyle>;

export interface IArea extends IGraphic<IAreaGraphicAttribute> {
  cacheArea?: IAreaCacheItem | IAreaCacheItem[];
}

type ISegmentStyle = Pick<
  IGraphicAttribute,
  'fill' | 'fillOpacity' | 'background' | 'texture' | 'textureColor' | 'textureSize' | 'texturePadding'
>;

export interface IAreaSegment extends Partial<ISegmentStyle>, Partial<IConnectedStyle> {
  points: IPointLike[];
}
