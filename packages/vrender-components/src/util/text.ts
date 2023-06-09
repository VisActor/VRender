import { getTextBounds, ITextGraphicAttribute } from '@visactor/vrender';
import { ITextMeasureOption, TextMeasure } from '@visactor/vutils';
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
export function measureTextSize(text: string | number | string[] | number[], textSpec: Partial<ITextGraphicAttribute>) {
  if (!text) {
    return { width: 0, height: 0 };
  }
  const bounds = getTextBounds({
    text,
    fontFamily: textSpec.fontFamily ?? '',
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
