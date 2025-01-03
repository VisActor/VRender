import type {
  IGroupGraphicAttribute,
  ILineGraphicAttribute,
  IPolygonGraphicAttribute,
  IRectGraphicAttribute
} from '@visactor/vrender-core';
import type { Point } from '../core/type';

export interface BaseCrosshairAttrs extends IGroupGraphicAttribute {
  type?: 'line' | 'rect' | 'circle' | 'polygon' | 'sector' | 'polygon-sector';
}

export interface PolarCrosshairAttrs extends BaseCrosshairAttrs {
  /**
   * 圆心
   */
  center: Point;
  /**
   * 半径
   */
  radius: number;
  /**
   * 起始弧度
   */
  startAngle?: number;
  /**
   * 结束弧度
   */
  endAngle?: number;
}

export interface LineCrosshairAttrs extends BaseCrosshairAttrs {
  type?: 'line';
  /**
   * 起始点坐标
   */
  start: Point;
  /**
   * 结束点坐标
   */
  end: Point;
  /**
   * 线样式
   */
  lineStyle?: Partial<ILineGraphicAttribute>;
}

export interface CircleCrosshairAttrs extends PolarCrosshairAttrs {
  type?: 'circle';
  /**
   * 线样式
   */
  lineStyle?: Partial<ILineGraphicAttribute>;
}

export interface RectCrosshairAttrs extends BaseCrosshairAttrs {
  type?: 'rect';
  /**
   * 起始点坐标
   */
  start: Point;
  /**
   * 结束点坐标
   */
  end: Point;
  /**
   * 线样式
   */
  rectStyle?: Partial<IRectGraphicAttribute>;
}

export interface SectorCrosshairAttrs extends PolarCrosshairAttrs {
  type?: 'sector';
  /**
   * 内半径
   */
  innerRadius?: number;
  /**
   * 样式配置
   */
  sectorStyle?: Partial<ILineGraphicAttribute>;
}

export interface PolygonCrosshairAttrs extends PolarCrosshairAttrs {
  type?: 'polygon';
  /** 多边形边数 */
  sides: number;
  /** 多边形样式 */
  lineStyle?: Partial<ILineGraphicAttribute>;
}

export interface PolygonSectorCrosshairAttrs extends PolarCrosshairAttrs {
  type?: 'polygon-sector';
  /**
   * 内半径
   */
  innerRadius?: number;
  /**
   * 样式配置
   */
  polygonSectorStyle?: Partial<IPolygonGraphicAttribute>;
}
