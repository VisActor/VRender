// 存放一些公共方法，公共配置
export interface ITextFontParams {
  fontStyle: string;
  fontVariant: string;
  fontWeight: string | number;
  fontSize: number;
  fontFamily: string;
}

export function getContextFont(
  text: Partial<ITextFontParams>,
  defaultAttr: Partial<ITextFontParams> = {},
  fontSizeScale?: number
): string {
  // if (fontSizeScale == null) {
  //   fontSizeScale = 1;
  // }
  fontSizeScale = 1;
  const {
    fontStyle = defaultAttr.fontStyle,
    fontVariant = defaultAttr.fontVariant,
    fontWeight = defaultAttr.fontWeight,
    fontSize = defaultAttr.fontSize,
    fontFamily = defaultAttr.fontFamily
  } = text;
  return (
    '' +
    (fontStyle ? fontStyle + ' ' : '') +
    (fontVariant ? fontVariant + ' ' : '') +
    (fontWeight ? fontWeight + ' ' : '') +
    fontSize * fontSizeScale +
    'px ' +
    (fontFamily ? fontFamily : 'sans-serif')
  );
}

export type ITextAlignType = 'left' | 'right' | 'center' | 'start' | 'end';
export type ITextBaselineType = 'top' | 'middle' | 'bottom' | 'alphabetic';

// TODO: 更好的方案
/**
 * 用于绘制的时候偏移
 * 经验值，来源于 https://github.com/vega/vega/blob/b45cf431cd6c0d0c0e1567f087f9b3b55bc236fa/packages/vega-scenegraph/src/util/text.js
 * @param baseline
 * @param h
 * @returns
 */
export function textDrawOffsetY(baseline: ITextBaselineType, h: number): number {
  const offset =
    baseline === 'top'
      ? Math.ceil(0.79 * h)
      : baseline === 'middle'
      ? Math.round(0.3 * h)
      : baseline === 'bottom'
      ? Math.round(-0.21 * h)
      : 0;
  return offset;
}

/**
 * 用于绘制的时候偏移
 * @param textAlign
 * @param width
 * @returns
 */
export function textDrawOffsetX(textAlign: ITextAlignType, width: number): number {
  if (textAlign === 'end' || textAlign === 'right') {
    return -width;
  } else if (textAlign === 'center') {
    return -width / 2;
  }
  return 0;
}

/**
 * 用于计算布局的偏移
 * 经验值，来源于 https://github.com/vega/vega/blob/b45cf431cd6c0d0c0e1567f087f9b3b55bc236fa/packages/vega-scenegraph/src/util/text.js
 * @param baseline
 * @param lineHeight
 * @returns
 */
export function textLayoutOffsetY(baseline: ITextBaselineType, lineHeight: number, fontSize: number): number {
  if (baseline === 'middle') {
    return -lineHeight / 2;
  }
  if (baseline === 'top') {
    return 0;
  }
  if (baseline === 'bottom') {
    return -lineHeight;
  }
  if (!baseline || baseline === 'alphabetic') {
    if (!fontSize) {
      fontSize = lineHeight;
    }
    return -(lineHeight - fontSize) / 2 - 0.79 * fontSize;
  }
  return 0;
}
