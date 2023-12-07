import type {
  Cursor,
  IColor,
  IGroupGraphicAttribute,
  IImageGraphicAttribute,
  IRectGraphicAttribute,
  IWrapTextGraphicAttribute
} from '@visactor/vrender-core';

export type CheckboxText = {
  disableFill?: IColor;
} & IWrapTextGraphicAttribute;

export type CheckboxIcon = {
  checkIconImage?: string | HTMLImageElement | HTMLCanvasElement;
  indeterminateIconImage?: string | HTMLImageElement | HTMLCanvasElement;
} & Omit<IImageGraphicAttribute, 'image'>;

export type CheckboxRect = {
  disableFill?: IColor;
  checkedFill?: IColor;
  checkedStroke?: IColor;
  disableCheckedFill?: IColor;
  disableCheckedStroke?: IColor;
} & IRectGraphicAttribute;

export type CheckboxAttributes = IGroupGraphicAttribute & {
  interactive?: boolean;
  disabled?: boolean;
  checked?: boolean;
  indeterminate?: boolean;
  /**
   * 图例文字
   */
  text?: CheckboxText;
  /**
   * 图例选中图标
   */
  icon?: CheckboxIcon;
  /**
   * 图例选中图标
   */
  box?: CheckboxRect;
  disableCursor?: Cursor;
  spaceBetweenTextAndIcon?: number;
};
