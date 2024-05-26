import type {
  IColor,
  IGroupGraphicAttribute,
  IImageGraphicAttribute,
  ITextGraphicAttribute
} from '@visactor/vrender-core';
import type { Padding, TextContent } from '../core/type';
export type EmptyTipText = {
  disableFill?: IColor;
} & ITextGraphicAttribute;

export type EmptyTipIcon = {
  emptyTipIconImage?: string | HTMLImageElement | HTMLCanvasElement;
} & Omit<IImageGraphicAttribute, 'image'>;

export type EmptyTipAttributes = IGroupGraphicAttribute & {
  /**
   * 整体（包括 text 和 icon）的水平对齐
   * 'left' | 'center' | 'right'
   */
  // align?: string;
  /**
   * 整体（包括 text 和 icon）的垂直对齐
   * 'top' | 'middle' | 'bottom'
   */
  verticalAlign?: string;

  /**
   * 图例容器内边距， [top, right, bottom, left]
   */
  padding?: Padding;

  text?: EmptyTipText;

  icon?: EmptyTipIcon;

  spaceBetweenTextAndIcon?: number;
};
