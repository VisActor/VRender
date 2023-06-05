import type Frame from '../../graphic/richtext/frame';
import type { IColor } from '../color';
import type { IGraphicAttribute, IGraphic } from '../graphic';
import type { IImage, IImageGraphicAttribute } from './image';

export type IRichTextAttribute = {
  width: number;
  height: number;
  ellipsis: boolean | string;
  wordBreak: RichTextWordBreak;
  verticalDirection: RichTextVerticalDirection;
  maxHeight: number;
  maxWidth: number;
  textAlign: RichTextGlobalAlignType;
  textBaseline: RichTextGlobalBaselineType;
  layoutDirection: RichTextLayoutDirectionType;
  textConfig: IRichTextCharacter[];
  singleLine: boolean;
};

export type IRichTextGraphicAttribute = Partial<IGraphicAttribute> & Partial<IRichTextAttribute>;

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
  lineHeight?: number;
  textAlign?: CanvasTextAlign; // left, right, center
  textBaseline?: CanvasTextBaseline;
  direction?: RichTextLayoutDirectionType;
};

export type IRichTextParagraphCharacter = IRichTextBasicCharacter & {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: boolean;
  stroke?: boolean;
  fillColor?: IColor;
  strokeColor?: IColor;
  fontWeight?: string;
  // lineHeight?: number;
  fontStyle?: RichTextFontStyle; // normal, italic, oblique
  textDecoration?: RichTextTextDecoration; // none, underline, line-through
  // textAlign?: RichTextTextAlign; // left, right, center
  script?: RichTextScript; // normal, sub, super
  underline?: boolean;
  lineThrough?: boolean;
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
  backgroundFill?: boolean;
  backgroundFillColor?: IColor; // 背景矩形填充颜色
  backgroundFillOpacity?: number; // 背景矩形填充透明度
  backgroundStroke?: boolean;
  backgroundStrokeColor?: IColor; // 背景矩形边框颜色
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
  backgroundFill?: boolean;
  backgroundFillColor?: IColor; // 背景矩形填充颜色
  backgroundFillOpacity?: number; // 背景矩形填充透明度
  backgroundStroke?: boolean;
  backgroundStrokeColor?: IColor; // 背景矩形边框颜色
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

export interface IRichText extends IGraphic<IRichTextGraphicAttribute> {
  getFrameCache: () => Frame;
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
