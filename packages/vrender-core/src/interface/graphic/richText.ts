import type { IColor } from '../color';
import type { IContext2d } from '../context';
import type { IGraphicAttribute, IGraphic } from '../graphic';
import type { IImage, IImageGraphicAttribute } from './image';
import type { ITextGraphicAttribute } from './text';

export type IRichTextAttribute = {
  /**
   * 富文本的总宽度
   */
  width: number;
  /**
   * 富文本的总高度
   */
  height: number;
  /**
   * 是否可编辑
   */
  editable: boolean;
  /**
   * 文本超长的时候是否显示省略字符串
   * 1. boolean类型，true 表示将截断后的省略字符串设置为..., false 表示不显示省略字符串
   * 2. string类型，表示显示省略字符串，并将省略字符串设置为指定的值
   */
  ellipsis: boolean | string;
  /**
   * 文字换行类型
   */
  wordBreak: RichTextWordBreak;
  /**
   * 文字垂直方向
   */
  verticalDirection: RichTextVerticalDirection;
  /**
   * 富文本的最大高度，超过这个高度根据ellipsis的配置展示省略字符串或者直接截断
   */
  maxHeight: number;
  /**
   * 富文本的最大宽度，超过这个宽度根据ellipsis的配置展示省略字符串或者直接截断
   */
  maxWidth: number;
  /**
   * 文字对齐方式
   */
  textAlign: RichTextGlobalAlignType;
  /**
   * 文字基线
   */
  textBaseline: RichTextGlobalBaselineType;
  /**
   * 富文本的布局方向
   */
  layoutDirection: RichTextLayoutDirectionType;
  /**
   * 富文本的内容配置
   */
  textConfig: IRichTextCharacter[];
  /**
   * 不自动换行，仅当用户设置了换行符的时候才换行
   */
  disableAutoWrapLine: boolean;
  /**
   * 是否强制单行显示
   */
  singleLine: boolean;
};

export type IRichTextGraphicAttribute = Partial<IGraphicAttribute & ITextGraphicAttribute> &
  Partial<IRichTextAttribute>;

export type RichTextWordBreak = 'break-word' | 'break-all';
export type RichTextVerticalDirection = 'top' | 'middle' | 'bottom';
export type RichTextGlobalAlignType = 'left' | 'right' | 'center';
export type RichTextGlobalBaselineType = 'top' | 'middle' | 'bottom';
export type RichTextLayoutDirectionType = 'horizontal' | 'vertical';
export type RichTextFontStyle = 'normal' | 'italic' | 'oblique';
export type RichTextTextDecoration = 'none' | 'underline' | 'line-through';
// export type RichTextTextAlign = 'left' | 'right' | 'center';
export type RichTextScript = 'normal' | 'sub' | 'super';

export type IRichTextBasicCharacter = {
  /**
   * 行高
   */
  lineHeight?: number | string;
  /**
   * 文字对齐方式
   * left, right, center
   */
  textAlign?: CanvasTextAlign;
  /**
   * 文字基线
   */
  textBaseline?: CanvasTextBaseline;
  /**
   * 文字方向
   */
  direction?: RichTextLayoutDirectionType;
};

/**
 * 富文本段落为文本类型时候的配置
 */
export type IRichTextParagraphCharacter = IRichTextBasicCharacter & {
  /**
   * 文本内容
   */
  text: string | number;
  /**
   * 富文本片段的字体大小
   */
  fontSize?: number;
  /**
   * 富文本片段的字体类型
   */
  fontFamily?: string;
  /**
   * 富文本片段的文字颜色
   */
  fill?: IColor | boolean;
  /**
   * 富文本片段的文字描边颜色
   */
  stroke?: IColor | boolean;
  /**
   * 富文本片段的文字字重
   */
  fontWeight?: string;
  /**
   * 富文本片段的文字描边宽度
   */
  lineWidth?: number;
  // lineHeight?: number;
  /**
   * 富文本片段的文字斜体设置，支持以下属性
   * normal, italic, oblique
   */
  fontStyle?: RichTextFontStyle;
  /**
   * 富文本片段的文字中划线设置，支持以下属性
   * none, underline, line-through
   */
  textDecoration?: RichTextTextDecoration;
  // textAlign?: RichTextTextAlign; // left, right, center
  script?: RichTextScript; // normal, sub, super
  /**
   * 富文本片段的文字下划线设置，是否显示下划线
   */
  underline?: boolean;
  /**
   * 富文本片段的文字中划线设置，是否显示中划线
   */
  lineThrough?: boolean;
  /**
   * 富文本片段的透明度
   */
  opacity?: number;
  /**
   * 富文本片段的文字填充透明度
   */
  fillOpacity?: number;
  /**
   * 富文本片段的文字描边透明度
   */
  strokeOpacity?: number;
  // direction?: RichTextLayoutDirectionType;
};

export type IRichTextImageCharacter = IRichTextBasicCharacter & {
  /**
   * 设置图片的内容，
   * 支持三种格式：
   * 1. 图片的url
   * 2. 图片的Image对象
   * 3. 图片的Canvas对象
   */
  image: string | HTMLImageElement | HTMLCanvasElement;
  /**
   * 图片的宽度
   */
  width: number;
  /**
   * 图片的高度
   */
  height: number;

  // hover相关属性
  // backgroundShow?: boolean; // 是否显示background
  /**
   * 背景的展示模式，支持以下属性
   * always： 一直显示
   * hover： 鼠标hover时显示
   */
  backgroundShowMode?: 'always' | 'hover';
  /**
   * 背景矩形填充颜色
   */
  backgroundFill?: boolean | IColor;
  /**
   * 背景矩形填充透明度
   */
  backgroundFillOpacity?: number;
  /**
   * 背景矩形边框颜色
   */
  backgroundStroke?: boolean | IColor;
  /**
   * 背景矩形边框透明度
   */
  backgroundStrokeOpacity?: number;
  /**
   * 背景矩形圆角
   */
  backgroundRadius?: number;
  // background size 同时控制了该icon的响应范围
  /**
   * 背景矩形的宽度
   */
  backgroundWidth?: number;
  /**
   * 背景矩形的高度
   */
  backgroundHeight?: number;

  /**
   * 唯一标识符
   */
  id?: string;

  // lineHeight?: number;
  // textAlign?: RichTextTextAlign; // left, right, center
  // direction?: RichTextLayoutDirectionType;
  /**
   * 图片与相邻节点的间距
   */
  margin?: number | number[];

  funcType?: string;
  hoverImage?: string | HTMLImageElement | HTMLCanvasElement;
};
/**
 * 富文本的字符类型
 */
export type IRichTextCharacter = IRichTextParagraphCharacter | IRichTextImageCharacter;

export type IRichTextIconGraphicAttribute = IImageGraphicAttribute & {
  /**
   * 唯一id
   */
  id?: string;
  /**
   * 背景的展示模式，支持以下属性
   * always： 一直显示
   * hover： 鼠标hover时显示
   * never： 不显示
   */
  backgroundShowMode?: 'always' | 'hover' | 'never';
  /**
   * 背景矩形填充颜色
   */
  backgroundFill?: boolean | IColor;
  /**
   * 背景矩形填充透明度
   */
  backgroundFillOpacity?: number;
  /**
   * 背景矩形边框颜色
   */
  backgroundStroke?: boolean | IColor;
  /**
   * 背景矩形边框透明度
   */
  backgroundStrokeOpacity?: number;
  /**
   * 背景矩形圆角
   */
  backgroundRadius?: number;
  /**
   * 背景矩形的宽度
   */
  backgroundWidth?: number;
  /**
   * 背景矩形的高度
   */
  backgroundHeight?: number;

  // lineHeight?: number;
  /**
   * 文字对齐方式
   * left, right, center
   */
  textAlign?: CanvasTextAlign;
  /**
   * 文字基线
   * top, middle, bottom
   */
  textBaseline?: CanvasTextBaseline;
  /**
   * 文字方向
   * horizontal, vertical
   */
  direction?: RichTextLayoutDirectionType;
  /**
   * 图片与相邻节点的间距
   */
  margin?: number | number[];

  // backgroundShow?: boolean;
};

export interface IRichTextParagraph {
  text: string;
  ascent: number;
  descent: number;
  width: number;
  height: number;
  lineHeight: number;
  fontSize: number;
  length: number;
  newLine: boolean;
  character: IRichTextParagraphCharacter;
  left: number;
  top: number;
  direction?: 'horizontal' | 'vertical';
  widthOrigin?: number;
  heightOrigin?: number;
  textBaseline?: CanvasTextBaseline;
  ellipsis: 'normal' | 'add' | 'replace' | 'hide';
  ellipsisWidth: number;
  ellipsisOtherParagraphWidth: number;
  verticalEllipsis?: boolean;
  updateWidth: () => void;
  draw: (ctx: IContext2d, baseline: number, deltaLeft: number, isLineFirst: boolean, textAlign: string) => void;
  getWidthWithEllips: (direction: string) => number;
}

export interface IRichTextLine {
  left: number;
  top: number;
  width: number;
  height: number;
  baseline: number;
  ascent: number;
  descent: number;
  paragraphs: (IRichTextParagraph | IRichTextIcon)[];
  actualWidth: number;
  blankWidth: number;
  textAlign: string;
  direction: 'horizontal' | 'vertical';
  directionKey: {
    width: string;
    height: string;
    left: string;
    x: string;
    y: string;
  };
  draw: (
    ctx: IContext2d,
    lastLine: boolean,
    x: number,
    y: number,
    drawEllipsis: boolean | string,
    drawIcon: (icon: IRichTextIcon, context: IContext2d, x: number, y: number, baseline: number) => void
  ) => void;
  getWidthWithEllips: (ellipsis: string) => number;
}

export interface IRichTextFrame {
  left: number;
  top: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
  actualHeight: number;
  ellipsis: boolean | string;
  wordBreak: 'break-word' | 'break-all';
  verticalDirection: 'top' | 'middle' | 'bottom';
  lines: IRichTextLine[];
  globalAlign: 'left' | 'center' | 'right' | 'start' | 'end';
  globalBaseline: 'top' | 'middle' | 'bottom';
  layoutDirection: 'horizontal' | 'vertical';
  directionKey: {
    width: string;
    height: string;
    left: string;
    top: string;
    bottom: string;
  };
  isWidthMax: boolean;
  isHeightMax: boolean;
  singleLine: boolean;
  icons: Map<string, IRichTextIcon>;
  draw: (
    ctx: IContext2d,
    drawIcon: (icon: IRichTextIcon, context: IContext2d, x: number, y: number, baseline: number) => void
  ) => boolean;
  getActualSize: () => {
    width: number;
    height: number;
  };
  getRawActualSize: () => {
    width: number;
    height: number;
  };
  getActualSizeWidthEllipsis: () => {
    width: number;
    height: number;
  };
}

export interface IRichText extends IGraphic<IRichTextGraphicAttribute> {
  getFrameCache: () => IRichTextFrame;
  cliped?: boolean;
}

export interface IRichTextIcon extends IImage {
  attribute: IRichTextIconGraphicAttribute;
  richtextId?: string;
  globalX?: number;
  globalY?: number;

  _x: number;
  _y: number;
  _hovered: boolean;
  _marginArray: [number, number, number, number];

  setHoverState: (hovered: boolean) => void;
}
