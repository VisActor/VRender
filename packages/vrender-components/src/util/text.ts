import type { ITextGraphicAttribute } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { getTextBounds } from '@visactor/vrender-core';
import type { ITextMeasureOption } from '@visactor/vutils';
// eslint-disable-next-line no-duplicate-imports
import { TextMeasure } from '@visactor/vutils';
import { DEFAULT_TEXT_FONT_FAMILY, DEFAULT_TEXT_FONT_SIZE } from '../constant';

export const initTextMeasure = (
  textSpec?: Partial<ITextGraphicAttribute>,
  option?: Partial<ITextMeasureOption>,
  useNaiveCanvas?: boolean
): TextMeasure<ITextGraphicAttribute> => {
  return new TextMeasure<ITextGraphicAttribute>(
    {
      defaultFontParams: {
        fontFamily: DEFAULT_TEXT_FONT_FAMILY,
        fontSize: DEFAULT_TEXT_FONT_SIZE
      },
      getTextBounds: useNaiveCanvas ? undefined : getTextBounds,
      specialCharSet: '-/: .,@%\'"~' + TextMeasure.ALPHABET_CHAR_SET + TextMeasure.ALPHABET_CHAR_SET.toUpperCase(),
      ...(option ?? {})
    },
    textSpec
  );
};

// FIXME: 和上一个方法统一，使用 TextMeasure 类
export function measureTextSize(
  text: string | number | string[] | number[],
  textSpec: Partial<ITextGraphicAttribute>,
  fontFamily: string = DEFAULT_TEXT_FONT_FAMILY
) {
  if (!text) {
    return { width: 0, height: 0 };
  }
  const bounds = getTextBounds({
    text,
    fontFamily: textSpec.fontFamily ?? fontFamily,
    fontSize: textSpec.fontSize || 12,
    fontWeight: textSpec.fontWeight as any,
    textAlign: textSpec.textAlign ?? 'center',
    textBaseline: textSpec.textBaseline,
    ellipsis: !!textSpec.ellipsis,
    maxLineWidth: textSpec.maxLineWidth || Infinity,
    lineHeight: textSpec.fontSize || 12
  });

  return { width: bounds.width(), height: bounds.height() };
}
