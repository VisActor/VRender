import type { ILineGraphicAttribute, IGroupGraphicAttribute } from '@visactor/vrender';
import type { Point } from '../../core/type';
import type { AxisItem, callbackFunc } from '../type';

export type SubGridAttributesForAxis = {
  /**
   * 是否展示子网格线
   */
  visible?: boolean;
  /**
   * 子网格线的个数
   */
  count?: number;
} & Pick<GridBaseAttributes, 'alternateColor' | 'style' | 'zIndex'>;

export interface IGrid3dType {
  beta: number;
  anchor3d?: [number, number];
}

export type GridItem = {
  /**
   * 标识符
   */
  id?: string | number;
  /** 网格线点集合 */
  points: Point[];
  [key: string]: any;
};

// 网格线配置
export type GridBaseAttributes = {
  type?: 'circle' | 'polygon' | 'line';
  /**
   * 是否展示网格线
   */
  visible?: boolean;
  /**
   * 网格线绘制点数据
   */
  items: AxisItem[];
  /**
   * 栅格线是否封闭
   */
  closed?: boolean;
  /**
   * 线样式配置
   */
  style?: ILineGraphicAttribute | callbackFunc<Partial<ILineGraphicAttribute> | undefined>;
  /**
   * 两个栅格线间的填充色
   */
  alternateColor?: string | string[];
  /**
   * 网格线的绘图层级
   */
  zIndex?: number;
  /** grid 是否与 label 对齐 */
  alignWithLabel?: boolean;
  /**
   * 子刻度对应网格线配置
   */
  subGrid?: SubGridAttributesForAxis;
  /**
   * 垂直于坐标轴方向的因子，默认为 1
   */
  verticalFactor?: number;
} & IGroupGraphicAttribute;

export type LineGridAttributes = {
  /**
   * 当用户配置了 alternateColor 属性时，填充区域是否进行弧线连接
   */
  smoothLink?: boolean;
  center?: Point;
  /**
   * 3d网格线的深度
   */
  depth?: number;
} & GridBaseAttributes;

export type PolygonGridAttributes = {
  type: 'polygon';
} & GridBaseAttributes;

export type CircleGridAttributes = {
  type: 'circle';
  /**
   * 用于圆弧型网格线的圆心位置声明
   */
  center: Point;
} & GridBaseAttributes;

export type GridAttributes = LineGridAttributes | CircleGridAttributes | PolygonGridAttributes;

export type LineGridOfLineAxisAttributes = LineGridAttributes & {
  type: 'line';
  /**
   * 网格线的长度
   */
  length: number;
};

export type PolarGridOfLineAxisAttributes = (PolygonGridAttributes | CircleGridAttributes) & {
  /**
   * 圆心
   */
  center?: Point;
  /**
   * 边数
   */
  sides?: number;
  /**
   * **弧度值**，起始弧度，默认 -0.5 * Math.PI
   *
   */
  startAngle?: number;
  /**
   * **弧度值**，结束弧度，默认 1.5 * Math.PI
   */
  endAngle?: number;
};

export type LineAxisGridAttributes = (LineGridOfLineAxisAttributes | PolarGridOfLineAxisAttributes) & {
  /**
   * 起始点坐标
   */
  start: Point;
  /**
   * 结束点坐标
   */
  end: Point;
};

export type CircleAxisGridAttributes = LineGridAttributes & {
  /**
   * 当配置了 innerRadius 时，可以通过设置 inside: true，将坐标轴战士在内圆半径上。
   * @default false
   */
  inside?: boolean;
  /**
   * 圆心坐标
   */
  center: Point;
  /**
   * **弧度值**，起始弧度，默认 -0.5 * Math.PI
   *
   */
  startAngle?: number;
  /**
   * **弧度值**，结束弧度，默认 1.5 * Math.PI
   */
  endAngle?: number;
  /**
   * 半径
   */
  radius: number;
  /** 内半径 */
  innerRadius?: number;
};
