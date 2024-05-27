import type {
  IColor,
  IGroupGraphicAttribute,
  IImageGraphicAttribute,
  ITextGraphicAttribute
} from '@visactor/vrender-core';
export type EmptyTipText = {
  disableFill?: IColor;
} & ITextGraphicAttribute;

export type EmptyTipIcon = IImageGraphicAttribute;

export type EmptyTipAttributes = IGroupGraphicAttribute & {
  text?: EmptyTipText;

  icon?: EmptyTipIcon;

  spaceBetweenTextAndIcon?: number;
};
