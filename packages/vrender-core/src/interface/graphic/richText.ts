import type { IColor } from '../color';
import type { IContext2d } from '../context';
import type { IGraphicAttribute, IGraphic } from '../graphic';
import type { IImage, IImageGraphicAttribute } from './image';
import type { ITextGraphicAttribute } from './text';

export type IRichTextAttribute = {
  width: number;
  height: number;
  editable: boolean;
  ellipsis: boolean | string;
  wordBreak: RichTextWordBreak;
  verticalDirection: RichTextVerticalDirection;
  maxHeight: number;
  maxWidth: number;
  textAlign: RichTextGlobalAlignType;
  textBaseline: RichTextGlobalBaselineType;
  layoutDirection: RichTextLayoutDirectionType;
  textConfig: IRichTextCharacter[];
  // 是否不自动每行截断
  disableAutoWrapLine: boolean;
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
  lineHeight?: number | string;
  textAlign?: CanvasTextAlign; // left, right, center
  textBaseline?: CanvasTextBaseline;
  direction?: RichTextLayoutDirectionType;
};

export type IRichTextParagraphCharacter = IRichTextBasicCharacter & {
  text: string | number;
  fontSize?: number;
  fontFamily?: string;
  fill?: IColor | boolean;
  stroke?: IColor | boolean;
  fontWeight?: string;
  lineWidth?: number;
  // lineHeight?: number;
  fontStyle?: RichTextFontStyle; // normal, italic, oblique
  textDecoration?: RichTextTextDecoration; // none, underline, line-through
  // textAlign?: RichTextTextAlign; // left, right, center
  script?: RichTextScript; // normal, sub, super
  underline?: boolean;
  lineThrough?: boolean;
  opacity?: number;
  fillOpacity?: number;
  strokeOpacity?: number;
  // direction?: RichTextLayoutDirectionType;
};

export type IRichTextImageCharacter = IRichTextBasicCharacter & {
  // 图片基础属性
  image: string | HTMLImageElement | HTMLCanvasElement;
  width: number;
  height: number;

  // hover相关属性
  // backgroundShow?: boolean; // 是否显示background
  backgroundShowMode?: 'always' | 'hover';
  backgroundFill?: boolean | IColor; // 背景矩形填充颜色
  backgroundFillOpacity?: number; // 背景矩形填充透明度
  backgroundStroke?: boolean | IColor; // 背景矩形边框颜色
  backgroundStrokeOpacity?: number; // 背景矩形边框透明度
  backgroundRadius?: number; // 背景矩形圆角
  // background size 同时控制了该icon的响应范围
  backgroundWidth?: number;
  backgroundHeight?: number;

  // 唯一标识符
  id?: string;

  // lineHeight?: number;
  // textAlign?: RichTextTextAlign; // left, right, center
  // direction?: RichTextLayoutDirectionType;
  margin?: number | number[];

  funcType?: string;
  hoverImage?: string | HTMLImageElement | HTMLCanvasElement;
};

export type IRichTextCharacter = IRichTextParagraphCharacter | IRichTextImageCharacter;

export type IRichTextIconGraphicAttribute = IImageGraphicAttribute & {
  id?: string;
  backgroundShowMode?: 'always' | 'hover' | 'never';
  backgroundFill?: boolean | IColor; // 背景矩形填充颜色
  backgroundFillOpacity?: number; // 背景矩形填充透明度
  backgroundStroke?: boolean | IColor; // 背景矩形边框颜色
  backgroundStrokeOpacity?: number; // 背景矩形边框透明度
  backgroundRadius?: number; // 背景矩形圆角
  backgroundWidth?: number;
  backgroundHeight?: number;

  // lineHeight?: number;
  textAlign?: CanvasTextAlign; // left, right, center
  textBaseline?: CanvasTextBaseline;
  direction?: RichTextLayoutDirectionType;

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
