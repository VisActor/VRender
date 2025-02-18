import type { IGraphicAttribute, IGraphic } from '../graphic';

export interface TextLayoutBBox {
  width: number; // 包围盒的宽度
  height: number; // 包围盒的高度
  xOffset: number;
  yOffset: number;
}

export interface LayoutItemType {
  str: string; // 这行的字符串
  leftOffset?: number; // 该行距离左侧的偏移
  topOffset?: number; // 该行距离右侧的偏移
  width: number;
  ascent: number;
  descent: number;
  keepCenterInLine: boolean;
}

export interface SimplifyLayoutType {
  lines: LayoutItemType[];
}

export interface LayoutType {
  bbox: TextLayoutBBox;
  lines: LayoutItemType[];
  fontFamily: string;
  fontSize: number;
  fontWeight?: string | number;
  lineHeight: number;
  textAlign: TextAlignType;
  textBaseline: TextBaselineType;
}

export enum MeasureModeEnum {
  estimate = 0,
  actualBounding = 1,
  fontBounding = 2
}

export type ITextAttribute = {
  /**
   * 文字内容
   */
  text: string | number | string[] | number[];
  /**
   * 单行的的最大长度，当超出这个长度，可以展示省略符或者换行、截断等
   * 后续可能去除
   */
  maxLineWidth: number;
  /**
   * 单行的的最大长度，当超出这个长度，可以展示省略符或者换行、截断等
   * 同 maxLineWidth
   */
  maxWidth: number;
  /**
   * 文字对齐方式
   */
  textAlign: TextAlignType;
  /**
   * 文字竖直方向的对齐方式
   */
  textBaseline: TextBaselineType;
  /**
   * 字号
   */
  fontSize: number;
  /**
   * 字体
   */
  fontFamily: string;
  /**
   * 字重
   */
  fontWeight: string | number;
  /**
   * 文字超出后的省略符
   */
  ellipsis: boolean | string;
  /**
   * 控制文本的小型大写字母（small-caps）显示
   */
  fontVariant: string;
  /**
   * 字体样式，是否为斜体等
   */
  fontStyle: string;
  /**
   * 行高（字符串类型表示比例值，如"150%"）
   */
  lineHeight: number | string;
  /**
   * 是否显示下划线
   */
  underline: number;
  /**
   * 是否显示中划线
   */
  lineThrough: number;
  /**
   * 在3d场景下是否根据z坐标缩放
   */
  scaleIn3d: boolean;
  /**
   * 文本的排布方向，如果需要文本纵向排布，可以配置为 'vertical'
   */
  direction: 'horizontal' | 'vertical';
  /**
   * 垂直布局的模式，0代表默认（横向textAlign，纵向textBaseline），1代表特殊（横向textBaseline，纵向textAlign）
   */
  verticalMode: number;
  /*
   * 单词断行
   */
  wordBreak: 'break-word' | 'break-all' | 'keep-all';
  /**
   * 内部配置，是否忽略一些bounds的buffer
   */
  ignoreBuf: boolean;
  /**
   * 高度限制控制显示内容及省略号
   */
  heightLimit: number;
  /**
   * 按照行数限制显示内容及省略号
   */
  lineClamp: number;
  /**
   * 同 whiteSpace: 'normal'
   * 后续可能删除
   */
  wrap: boolean;
  /**
   * 设置如何处理空白字符
   */
  whiteSpace: 'normal' | 'no-wrap';
  /**
   * 省略号的位置，默认为'end'
   */
  suffixPosition: 'start' | 'end' | 'middle';
  /**
   * 下划线的虚线样式
   */
  underlineDash: number[];
  /**
   * 下划线的虚线偏移量
   */
  underlineOffset: number;
  /**
   * 关闭poptip
   */
  disableAutoClipedPoptip?: boolean;
  /**
   * @since 0.21.0
   * 测量模式，默认使用actualBounding
   */
  measureMode?: MeasureModeEnum;

  /**
   * @since 0.21.0
   * 保持在行中间的位置
   */
  keepCenterInLine?: boolean;
};
export type ITextCache = {
  // 单行文本的时候缓存（多行文本没有）
  clipedText?: string;
  clipedWidth?: number;
  // 文本的布局缓存（单行文本也有）
  layoutData?: LayoutType;
  // 垂直布局的列表
  verticalList?: { text: string; width?: number; direction: number }[][];
};

export type ITextGraphicAttribute = Partial<IGraphicAttribute> & Partial<ITextAttribute>;

export type IWrapTextGraphicAttribute = ITextGraphicAttribute & {
  heightLimit?: number;
  lineClamp?: number;
};

export interface IText extends IGraphic<ITextGraphicAttribute> {
  // 判断是否被ellipisised
  clipedText?: string;
  clipedWidth?: number;
  cliped?: boolean;
  multilineLayout?: LayoutType;
  font?: string;
  isMultiLine: boolean;
  cache?: ITextCache;

  getBaselineMapAlign: () => Record<string, string>;
  getAlignMapBaseline: () => Record<string, string>;
}

export type TextAlignType = 'left' | 'right' | 'center' | 'start' | 'end';
export type TextBaselineType = 'top' | 'middle' | 'bottom' | 'alphabetic';
