import type { GraphicEventType, IGroupGraphicAttribute, IPolygonGraphicAttribute } from '@visactor/vrender/es/core';
import type { IDelayType } from '../interface';

export interface BrushAttributes extends IGroupGraphicAttribute {
  /**
   * 触发框选的事件名称
   */
  trigger?: GraphicEventType;
  /**
   * 更新框选的事件名称
   */
  updateTrigger?: GraphicEventType;
  /**
   * 结束框选的事件名称
   */
  endTrigger?: GraphicEventType;
  /**
   * 清空框选的事件名称
   */
  resetTrigger?: GraphicEventType;
  /**
   * 可交互范围
   */
  interactiveRange?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  /**
   * 框选模式
   * @default 'single'
   */
  brushMode?: IBrushMode;
  /**
   * 框选类型
   * @default 'rect'
   */
  brushType?: IBrushType;
  /**
   * brushType为'y'时, x的左右边界位置, 不配置的话不会生效
   * @default [0,0]
   */
  xRange?: [number, number];
  /**
   * brushType为'x'时, y的左右边界位置, 不配置的话不会生效
   * @default [0,0]
   */
  yRange?: [number, number];
  /** 是否展示brush mask */
  hasMask?: boolean;
  /**
   * 框选区域的样式
   */
  brushStyle?: IPolygonGraphicAttribute;
  /**
   * 是否可被平移
   * @default true
   */
  brushMoved?: boolean;
  /**
   * brushMode为'single'时，是否单击清除选框
   * @default true
   */
  removeOnClick?: boolean;
  /**
   * brush选框的大小阈值
   */
  sizeThreshold?: number;
  /**
   * 事件触发延迟类型
   * @default 'throttle'
   */
  delayType?: IDelayType;
  /**
   * 事件触发延迟时长
   * @default 0
   */
  delayTime?: number;
  /**
   * 关闭交互效果
   * @default false
   */
  disableTriggerEvent?: boolean;
}

export type IBrushType = 'x' | 'y' | 'rect' | 'polygon';
export type IBrushMode = 'single' | 'multiple';

export enum IOperateType {
  drawStart = 'drawStart',
  drawEnd = 'drawEnd',
  drawing = 'drawing',
  moving = 'moving',
  moveStart = 'moveStart',
  moveEnd = 'moveEnd',
  brushClear = 'brushClear'
}
