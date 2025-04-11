import type {
  IGraphic,
  IGroupGraphicAttribute,
  IRectGraphicAttribute,
  ISymbolGraphicAttribute,
  ITextGraphicAttribute
} from '@visactor/vrender-core';
import type { Padding, State } from '../core/type';
import type { BackgroundAttributes } from '../interface';
import type { IAABBBoundsLike } from '@visactor/vutils';

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
  /**
   * 弹出框的方位，有 12 个方位可供选择
   */
  position?:
    | 'auto'
    | 'top'
    | 'tl'
    | 'tr'
    | 'bottom'
    | 'bl'
    | 'br'
    | 'left'
    | 'lt'
    | 'lb'
    | 'right'
    | 'rt'
    | 'rb'
    | string[];
  /**
   * @since 0.22.7
   * 锚点，默认是position，即锚点在position的位置，如果设置为bounds，则锚点会基于bounds进行计算
   */
  poptipAnchor?: 'position' | 'bounds';
  /**
   * @since 0.22.7
   * 布局的包围盒
   * positionBounds 是定位的包围盒，如果配置了的话
   * position为'top' | 'tl' | 'tr': 锚点为positionBounds的上方中间位置
   * position为'bottom' | 'bl' | 'br': 锚点为positionBounds的下方中间位置
   * position为'left' | 'lt' | 'lb': 锚点为positionBounds的左侧中间位置
   * position为'right' | 'rt' | 'rb': 锚点为positionBounds的右侧中间位置
   */
  positionBounds?: IAABBBoundsLike;
  /**
   * 标题内容，如果需要进行换行，则使用数组形式，如 ['abc', '123']
   */
  title?: string | string[] | number | number[];
  /**
   * 标题样式
   */
  titleStyle?: Partial<ITextGraphicAttribute>;
  /**
   * 标题的格式化方法
   */
  titleFormatMethod?: (t: string | string[] | number | number[]) => string | string[] | number | number[];
  /**
   * 内容文本，如果需要进行换行，则使用数组形式，如 ['abc', '123']
   */
  content?: string | string[] | number | number[];
  /**
   * 内容文本样式
   */
  contentStyle?: Partial<ITextGraphicAttribute>;
  /**
   * 内容的格式化方法
   */
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

  /**
   * 最大宽度比例
   */
  maxWidthPercent?: number;
  /**
   * 是否展示
   */
  visible?: boolean;
  /**
   * 自定义的展示逻辑
   */
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
