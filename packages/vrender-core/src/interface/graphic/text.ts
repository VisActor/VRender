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
  text: string | number | string[] | number[];
  maxLineWidth: number;
  maxWidth: number;
  textAlign: TextAlignType;
  textBaseline: TextBaselineType;
  fontSize: number;
  fontFamily: string;
  fontWeight: string | number;
  ellipsis: boolean | string;
  fontVariant: string;
  fontStyle: string;
  lineHeight: number | string;
  underline: number;
  lineThrough: number;
  scaleIn3d: boolean;
  direction: 'horizontal' | 'vertical';
  verticalMode: number; // 垂直布局的模式，0代表默认（横向textAlign，纵向textBaseline），1代表特殊（横向textBaseline，纵向textAlign）
  wordBreak: 'break-word' | 'break-all' | 'keep-all';
  ignoreBuf: boolean;
  heightLimit: number;
  lineClamp: number;
  wrap: boolean;
  whiteSpace: 'normal' | 'no-wrap';
  suffixPosition: 'start' | 'end' | 'middle';
  underlineDash: number[];
  underlineOffset: number;
  // textDecoration: number;
  // textDecorationWidth: number;
  // padding?: number | number[];
  disableAutoClipedPoptip?: boolean;
  // @since 0.21.0
  // 测量模式，默认使用actualBounding
  measureMode?: MeasureModeEnum;
  // @since 0.21.0
  // 保持在行中间的位置
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
