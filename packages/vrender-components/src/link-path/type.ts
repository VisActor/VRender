import type { IGroupGraphicAttribute, IGraphicAttribute } from '@visactor/vrender/es/core';
import type { Direction } from '../interface';

export interface LinkPathAttributes extends IGroupGraphicAttribute {
  /**
   * 滚动条的布局方向，默认为 `horizontal`，水平布局。
   * @default horizontal
   */
  direction?: Direction;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  thickness: number;
  /** round all the coordinates */
  round?: boolean;
  /** the ratio of normal style path */
  ratio?: number;
  align?: 'start' | 'end' | 'center';
  isSmooth?: boolean;
  backgroudStyle?: Partial<IGraphicAttribute>;
  endArrow?: boolean;
  startArrow?: boolean;
}
