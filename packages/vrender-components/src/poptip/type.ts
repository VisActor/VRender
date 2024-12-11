import type {
  IGraphic,
  IGroupGraphicAttribute,
  IRectGraphicAttribute,
  ISymbolGraphicAttribute,
  ITextGraphicAttribute
} from '@visactor/vrender-core';
import type { Padding, State } from '../core/type';
import type { BackgroundAttributes } from '../interface';

type StateStyle = {
  /**
   * title 文本的状态配置
   */
  title?: State<Partial<ITextGraphicAttribute>>;
  /**
   * content 文本的状态配置
   */
  content?: State<Partial<ITextGraphicAttribute>>;
  /**
   * panel 背景的状态配置ß
   */
  panel?: State<Partial<IRectGraphicAttribute>>;
};

export type PopTipAttributes = {
  /** 位置，参考arco design */
  position?: 'auto' | 'top' | 'tl' | 'tr' | 'bottom' | 'bl' | 'br' | 'left' | 'lt' | 'lb' | 'right' | 'rt' | 'rb';
  /**
   * 标题内容，如果需要进行换行，则使用数组形式，如 ['abc', '123']
   */
  title?: string | string[] | number | number[];
  /** 标题样式 */
  titleStyle?: Partial<ITextGraphicAttribute>;
  titleFormatMethod?: (t: string | string[] | number | number[]) => string | string[] | number | number[];
  /**
   * 内容文本，如果需要进行换行，则使用数组形式，如 ['abc', '123']
   */
  content?: string | string[] | number | number[];
  /** 内容文本样式 */
  contentStyle?: Partial<ITextGraphicAttribute>;
  contentFormatMethod?: (t: string | string[] | number | number[]) => string | string[] | number | number[];
  /**
   * 标题与内容的间距
   */
  space?: number;
  /**
   * 内部边距
   */
  padding?: Padding;
  /**
   * 标签的背景面板配置, TODO: 支持symbol形状
   * space: 与位置之间的距离
   * square: 是否是正方形
   */
  panel?: BackgroundAttributes &
    ISymbolGraphicAttribute & { space?: number; square?: boolean; panelSymbolType?: string };

  // 标签三角的模式，默认是default，即默认的三角形状，concise是紧凑型三角形状显得更简洁
  // @since 0.22.0
  triangleMode?: 'default' | 'concise';

  // 放置在poptip前方的logo区域
  logoSymbol?: ISymbolGraphicAttribute;
  // logo内的text
  logoText?: string | string[] | number | number[];
  // logo内的text样式
  logoTextStyle?: Partial<ITextGraphicAttribute>;

  /**
   * 最小宽度，像素值
   * @default 30
   */
  minWidth?: number;
  /**
   * 最大宽度，像素值。当文字超过最大宽度时，会自动省略。
   */
  maxWidth?: number;

  // 最大宽度比例
  maxWidthPercent?: number;

  visible?: boolean;
  visibleFunc?: (graphic: IGraphic) => boolean;
  state?: StateStyle;
  dx?: number;
  dy?: number;
} & Omit<IGroupGraphicAttribute, 'background'>;

export type PoptipShapeAttributes = {
  /**
   * 是否展示 shape
   */
  visible: boolean;
} & Partial<ISymbolGraphicAttribute>;
