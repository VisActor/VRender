import type { IPointLike } from '@visactor/vutils';
import type { ISegPath2D } from '../curve';
import type { IConnectedStyle, IGraphic, IGraphicAttribute } from '../graphic';
import type { ICurveType } from '../common';

export type IAreaAttribute = {
  /**
   * 分段设置point和样式
   */
  segments: IAreaSegment[];
  /**
   * 所有的点坐标
   */
  points: IPointLike[];
  /**
   * 曲线的类型，默认为linear
   */
  curveType: ICurveType;
  /**
   * 线段的裁切比例/显示长度占总长度的比例
   */
  clipRange: number;
  /**
   * 是否是闭合曲线
   */
  closePath: boolean;
  /**
   * 曲线类型为catmullRom时，对应的张力参数
   */
  curveTension: number;
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
