import type {
  IGroupGraphicAttribute,
  ITextGraphicAttribute,
  IRichTextCharacter,
  RichTextWordBreak
} from '@visactor/vrender-core';
import type { Padding } from '../core/type';

export interface TitleAttrs extends IGroupGraphicAttribute {
  /**
   * 主标题文本内容
   * - 支持富文本配置
   */
  text?: string | number | string[] | number[] | IRichTextCharacter[];
  /**
   * 主标题文本类型（默认类型为text）
   * text, rich, html
   */
  textType?: string;
  /**
   * 副标题文本内容
   * - 支持富文本配置
   */
  subtext?: string | number | string[] | number[] | IRichTextCharacter[];
  /**
   * 副标题文本类型（默认类型为text）
   * text, rich, html
   */
  subtextType?: string;
  /**
   * 指定宽度，像素值
   */
  width?: number;
  /**
   * 指定高度，像素值
   */
  height?: number;
  /**
   * 最小宽度，像素值
   */
  minWidth?: number;
  /**
   * 最大宽度，像素值。当文字超过最大宽度时，会自动省略。
   */
  maxWidth?: number;
  /**
   * 最小高度，像素值
   */
  minHeight?: number;
  /**
   * 最大高度，像素值
   */
  maxHeight?: number;
  /**
   * 内部边距
   */
  padding?: Padding;
  /**
   * x方向偏移量
   */
  x?: number;
  /**
   * y方向偏移量
   */
  y?: number;
  /**
   * 整体（包括 text 和 subtext）的水平对齐
   * 'left' | 'center' | 'right'
   */
  align?: string;
  /**
   * 整体（包括 text 和 subtext）的垂直对齐
   * 'top' | 'middle' | 'bottom'
   */
  verticalAlign?: string;
  /**
   * 主标题样式
   */
  textStyle?: {
    /** 指定宽度 */
    width?: number;
    /** 指定高度 */
    height?: number;
    /** 最大宽度 */
    maxWidth?: number;
    /** 最大高度 */
    maxHeight?: number;
    /**
     * 文字水平对齐方式
     * 'left' | 'center' | 'right'
     */
    align?: string;
    /**
     * 文字垂直对齐方式
     * 'top' | 'middle' | 'bottom'
     */
    verticalAlign?: string;
    /**
     * 折行方式
     * 'break-word' | 'break-all'
     */
    wordBreak?: RichTextWordBreak;
    /**
     * 按照宽度限制自动折行或显示省略号(maxLineWidth)
     * 默认设置为title宽度
     */
    maxLineWidth?: number;
    /**
     * 高度限制控制显示内容及省略号(heightLimit)
     */
    heightLimit?: number;
    /**
     * 按照行数限制显示内容及省略号(lineClamp)
     */
    lineClamp?: number;
    /**
     * 富文本配置（暂时保留旧设置）
     */
    character?: IRichTextCharacter[];
  } & Partial<ITextGraphicAttribute>;
  /**
   * 副标题样式
   */
  subtextStyle?: {
    /** 指定宽度 */
    width?: number;
    /** 指定高度 */
    height?: number;
    /** 最大宽度 */
    maxWidth?: number;
    /** 最大高度 */
    maxHeight?: number;
    /**
     * 文字水平对齐方式
     * 'left' | 'center' | 'right'
     */
    align?: string;
    /**
     * 文字垂直对齐方式
     * 'top' | 'middle' | 'bottom'
     */
    verticalAlign?: string;
    /**
     * 折行方式
     * 'break-word' | 'break-all'
     */
    wordBreak?: RichTextWordBreak;
    /**
     * 按照宽度限制自动折行或显示省略号(maxLineWidth)
     * 默认设置为title宽度
     */
    maxLineWidth?: number;
    /**
     * 高度限制控制显示内容及省略号(heightLimit)
     */
    heightLimit?: number;
    /**
     * 按照行数限制显示内容及省略号(lineClamp)
     */
    lineClamp?: number;
    /**
     * 富文本配置（暂时保留旧设置）
     */
    character?: IRichTextCharacter[];
  } & Partial<ITextGraphicAttribute>;
}
