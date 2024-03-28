import type { IRichTextAttribute, ITextGraphicAttribute } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { getTextBounds } from '@visactor/vrender-core';
import type { ITextMeasureOption } from '@visactor/vutils';
// eslint-disable-next-line no-duplicate-imports
import { TextMeasure, isObject } from '@visactor/vutils';
import { DEFAULT_TEXT_FONT_FAMILY, DEFAULT_TEXT_FONT_SIZE } from '../constant';
import type { TextContent } from '../core/type';

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
  defaultTextTheme: Partial<ITextGraphicAttribute> = {}
) {
  if (!text) {
    return { width: 0, height: 0 };
  }
  const bounds = getTextBounds({
    text,
    fontFamily: textSpec.fontFamily || defaultTextTheme.fontFamily || DEFAULT_TEXT_FONT_FAMILY,
    fontSize: textSpec.fontSize || defaultTextTheme.fontSize || 12,
    fontWeight: textSpec.fontWeight || defaultTextTheme.fontWeight,
    textAlign: textSpec.textAlign || 'center',
    textBaseline: textSpec.textBaseline,
    ellipsis: !!textSpec.ellipsis,
    maxLineWidth: textSpec.maxLineWidth || Infinity,
    lineHeight: textSpec.fontSize || defaultTextTheme.fontSize || 12
  });

  return { width: bounds.width(), height: bounds.height() };
}

export function isRichText(attributes: TextContent, typeKey = 'type') {
  return (
    (typeKey in attributes && attributes[typeKey] === 'rich') ||
    (isObject(attributes.text) && (attributes.text as TextContent).type === 'rich')
  );
}

export function richTextAttributeTransform(attributes: ITextGraphicAttribute & IRichTextAttribute & TextContent) {
  attributes.width = attributes.width ?? 0;
  attributes.height = attributes.height ?? 0;
  attributes.maxWidth = attributes.maxLineWidth;
  attributes.textConfig = (attributes.text as unknown as any).text || attributes.text;
  return attributes;
}
