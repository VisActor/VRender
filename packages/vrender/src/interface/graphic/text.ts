import type { IAABBBounds } from '@visactor/vutils';
import type { LayoutType } from '../../core/contributions/textMeasure/layout';
import type { IGraphicAttribute, IGraphic } from '../graphic';

export type ITextAttribute = {
  text: string | number | string[] | number[];
  maxLineWidth: number;
  textAlign: TextAlignType;
  textBaseline: TextBaselineType;
  fontSize: number;
  fontFamily: string;
  fontWeight: string | number;
  ellipsis: boolean | string;
  fontVariant: string;
  fontStyle: string;
  lineHeight: number;
  underline: number;
  lineThrough: number;
  // textDecoration: number;
  // textDecorationWidth: number;
  // padding?: number | number[];
};
export type ITextCache = {
  // 单行文本的时候缓存用
  clipedText?: string;
  clipedWidth?: number;
  // 多行文本的布局缓存
  layoutData?: LayoutType;
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
  cache?: ITextCache;

  updateMultilineAABBBounds: (text: (number | string)[]) => IAABBBounds;
  updateSingallineAABBBounds: (text: number | string) => IAABBBounds;
}

export type TextAlignType = 'left' | 'right' | 'center' | 'start' | 'end';
export type TextBaselineType = 'top' | 'middle' | 'bottom' | 'alphabetic';
