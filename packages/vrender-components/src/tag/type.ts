import type {
  ITextGraphicAttribute,
  ISymbolGraphicAttribute,
  IGroupGraphicAttribute,
  IRectGraphicAttribute,
  IRichTextCharacter,
  IRichTextGraphicAttribute
} from '@visactor/vrender-core';
import type { Padding, State } from '../core/type';
import type { BackgroundAttributes } from '../interface';

type StateStyle = {
  /**
   * text 文本的状态配置
   */
  text?: State<Partial<ITextGraphicAttribute>>;
  /**
   * shape 标记的状态配置
   */
  shape?: State<Partial<ISymbolGraphicAttribute>>;
  /**
   * panel 背景的状态配置ß
   */
  panel?: State<Partial<IRectGraphicAttribute>>;
};

export type TagAttributes = {
  /** 文本样式 */
  textStyle?: Partial<ITextGraphicAttribute> | Partial<IRichTextGraphicAttribute>;
  /** 文本前 mark 图元 */
  shape?: TagShapeAttributes;
  /**
   * shape 同文本之间的间距
   */
  space?: number;
  /**
   * 内部边距
   */
  padding?: Padding;
  /**
   * 标签的背景面板配置, TODO: 支持symbol形状
   */
  panel?: BackgroundAttributes;
  /**
   * 最小宽度，像素值
   * @default 30
   */
  minWidth?: number;
  /**
   * 最大宽度，像素值。当文字超过最大宽度时，会自动省略。
   */
  maxWidth?: number;
  visible?: boolean;
  state?: StateStyle;
} & Omit<IGroupGraphicAttribute, 'background'> &
  TextContent;

export type TagShapeAttributes = {
  /**
   * 是否展示 shape
   */
  visible: boolean;
} & Partial<ISymbolGraphicAttribute>;

type CommonTextContent = {
  type?: 'text';
  text?: string | string[] | number | number[];
};

type RichTextContent = {
  type?: 'rich';
  text?: IRichTextCharacter[];
};

type HtmlTextContent = {
  type?: 'html';
  text?: string;
};

export type TextContent = CommonTextContent & RichTextContent & HtmlTextContent;
