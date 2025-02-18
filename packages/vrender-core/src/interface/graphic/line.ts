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
  /**
   * 分段设置point和样式
   */
  segments: ISegment[];
  /**
   * 所有点的坐标，segments 和 points 不能同时生效
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
   * 裁剪的维度
   */
  clipRangeByDimension: IClipRangeByDimensionType;
  /**
   * 是否封闭路径
   */
  closePath: boolean;
  /**
   * 曲线类型为catmullRom时，对应的张力参数
   */
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
