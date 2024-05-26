import type {
  Cursor,
  IColor,
  IGroupGraphicAttribute,
  IImageGraphicAttribute,
  IRectGraphicAttribute,
  ITextGraphicAttribute
} from '@visactor/vrender-core';

export type EmptyTipText = {
  disableFill?: IColor;
} & ITextGraphicAttribute;

export type EmptyTipIcon = {
  emptyTipIconImage?: string | HTMLImageElement | HTMLCanvasElement;
} & Omit<IImageGraphicAttribute, 'image'>;

export type EmptyTipAttributes = IGroupGraphicAttribute & {
  text?: EmptyTipText;

  icon?: EmptyTipIcon;

  spaceBetweenTextAndIcon?: number;
};
