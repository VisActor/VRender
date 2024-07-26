import type { IPointLike } from '@visactor/vutils';
import type { IGraphicAttribute, IGraphic, IConnectedStyle } from '../graphic';
import type { ICurveType } from '../common';
import type { ISegPath2D } from '../curve';

// 依据x纬度做clipRange
// 依据y纬度做clipRange
// 依据线段自动匹配纬度做clipRange
// 依据线长纬度做clipRange
export type IClipRangeByDimensionType = 'x' | 'y' | 'auto' | 'default';

export type ILineAttribute = {
  segments: ISegment[]; // 分段设置point和样式
  points: IPointLike[]; // segments points 二选一
  curveType: ICurveType;
  clipRange: number;
  clipRangeByDimension: IClipRangeByDimensionType;
  closePath: boolean; // 是否封闭路径
  curveTension: number;
};

export type ILineGraphicAttribute = Partial<IGraphicAttribute> & Partial<ILineAttribute> & Partial<IConnectedStyle>;

export interface ILine extends IGraphic<ILineGraphicAttribute> {
  cache?: ISegPath2D | ISegPath2D[];
}

type ISegmentStyle = Pick<
  IGraphicAttribute,
  'stroke' | 'strokeOpacity' | 'lineDash' | 'lineDashOffset' | 'lineCap' | 'lineJoin' | 'lineWidth' | 'miterLimit'
>;

export interface ISegment extends Partial<ISegmentStyle>, Partial<IConnectedStyle> {
  points: IPointLike[];
  simplify?: boolean;
}
