import type {
  IGraphicAttribute,
  IGroupGraphicAttribute,
  IRectGraphicAttribute,
  ITextAttribute,
  IRichTextCharacter
} from '@visactor/vrender-core';
import type { IBounds, IPadding } from '@visactor/vutils';

export interface IContainerSize {
  width?: number;
  height?: number;
}

export type TooltipAttributes = IGroupGraphicAttribute & TooltipComponentAttrs;

export type TooltipComponentAttrs = TooltipPositionAttrs & {
  /** tooltip 背景 */
  panel?: TooltipPanelAttrs;

  /** tooltip 标题 */
  title?: TooltipRowAttrs;
  /** tooltip 内容 */
  content?: TooltipRowAttrs[];

  /** 标题样式 */
  titleStyle?: TooltipRowStyleAttrs;
  /** 内容样式 */
  contentStyle?: TooltipRowStyleAttrs;

  /** 是否自动计算 tooltip 大小 */
  autoMeasure?: boolean;

  /** 是否自动计算 tooltip 位置 */
  autoCalculatePosition?: boolean;

  /** 整体边距 */
  padding?: number | number[] | IPadding;

  /** 最小宽度 */
  minWidth?: number;
  /** 最大宽度 */
  maxWidth?: number;

  /** 是否可交互 */
  enterable?: boolean;

  /** 缓动 duration */
  transitionDuration?: number;

  // 以下为组件自动计算的属性
  /** 内容项是否有 shape */
  hasContentShape?: boolean;
  /** 内容项 key 的最大宽度，用于布局，因为 key 需要按照列对齐 */
  keyWidth?: number;
  /** 内容项 value 的最大宽度，用于布局，因为 value 需要按照列对齐 */
  valueWidth?: number;
  /**
   * @since 0.19.10
   *
   * shape、key、value的对齐方式，可选项如下：
   * 'left': 从左到右对齐
   * 'right': 从右到左对齐
   */
  align?: 'left' | 'right';
};

/** tooltip 文本样式 */
export type TooltipTextAttrs = Omit<Partial<ITextAttribute & IGraphicAttribute & IContainerSize>, 'text'> & {
  /**
   * 文本内容
   * - 支持富文本配置
   */
  text?: string | number | string[] | number[] | TooltipRichTextAttrs;
  /** 文本是否支持多行显示 */
  multiLine?: boolean;
  /** 文本换行模式 */
  wordBreak?: string;
};

export type TooltipRichTextAttrs = {
  /**
   * 文本类型（默认类型为text）
   * text, rich, html
   */
  type?: string;
  text?: IRichTextCharacter[] | string;
};

/** tooltip symbol 样式 */
export type TooltipSymbolAttrs = Partial<IGraphicAttribute> & {
  /** 图形 path */
  path?: string;
  size?: number;
  symbolType?: string;
  /** 其他图形样式，暂时这么处理 */
  [key: string]: any;
};

/** tooltip 背景样式 */
export type TooltipPanelAttrs = Partial<IRectGraphicAttribute> & {
  shadow?: boolean;
  shadowSpread?: number;
};

/** tooltip 内容行配置 */
export type TooltipRowAttrs = IContainerSize & {
  visible?: boolean;
  /** key 对应图形样式（title 没有这个属性） */
  key?: TooltipTextAttrs;
  /** value 对应图形样式 */
  value?: TooltipTextAttrs;
  /** shape 对应图形样式 */
  shape?: TooltipSymbolAttrs;
  /** 行间距 */
  spaceRow?: number;
};

/** tooltip 内容行样式 */
export type TooltipRowStyleAttrs = {
  /** key 对应图形样式（title 没有这个属性） */
  key?: Omit<TooltipTextAttrs, 'text'> & TooltipColumnStyleAttrs;
  /** value 对应图形样式 */
  value?: Omit<TooltipTextAttrs, 'text'> & TooltipColumnStyleAttrs;
  /** shape 对应图形样式 */
  shape?: TooltipSymbolAttrs & TooltipColumnStyleAttrs;
  /** 行间距 */
  spaceRow?: number;
};

export type TooltipColumnStyleAttrs = {
  /** 右边距 */
  spacing?: number;
};

export type TooltipPositionAttrs = {
  /** 光标位置 x */
  pointerX?: number;
  /** 光标位置 y */
  pointerY?: number;

  /** tooltip 偏移 x */
  offsetX?: number;
  /** tooltip 偏移 y */
  offsetY?: number;

  /** tooltip 相对 pointer 位置（x 轴） */
  positionX?: 'left' | 'right' | 'center';
  /** tooltip 相对 pointer 位置（y 轴） */
  positionY?: 'top' | 'bottom' | 'middle';

  /** 父级 bounds */
  parentBounds?: IBounds;
};
