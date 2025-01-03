import type {
  Cursor,
  ICircleGraphicAttribute,
  IColor,
  IGroupGraphicAttribute,
  IRectGraphicAttribute,
  ITextGraphicAttribute
} from '@visactor/vrender-core';

export type SwitchRect = {
  checkedFill?: IColor;
  uncheckedFill?: IColor;
  disableCheckedFill?: IColor;
  disableUncheckedFill?: IColor;
} & IRectGraphicAttribute;

export type SwitchCircle = ICircleGraphicAttribute;

export type SwitchText = {
  checkedText?: string;
  uncheckedText?: string;
} & ITextGraphicAttribute;

export type SwitchAttributes = IGroupGraphicAttribute & {
  interactive?: boolean;
  disabled?: boolean;
  checked?: boolean;

  text?: SwitchText;
  circle?: SwitchCircle;
  box?: SwitchRect;
  disableCursor?: Cursor;

  spaceBetweenTextAndCircle?: number;
};
