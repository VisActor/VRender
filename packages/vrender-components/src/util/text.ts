import type {
  IRichText,
  IRichTextAttribute,
  IText,
  ITextGraphicAttribute,
  TextAlignType
} from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { getTextBounds, graphicCreator } from '@visactor/vrender-core';
import type { ITextMeasureOption } from '@visactor/vutils';
// eslint-disable-next-line no-duplicate-imports
import { TextMeasure, isObject, isValid } from '@visactor/vutils';
import { DEFAULT_TEXT_FONT_FAMILY, DEFAULT_TEXT_FONT_SIZE } from '../constant';
import type { HTMLTextContent, ReactTextContent, TextContent } from '../core/type';

export const initTextMeasure = (
  textSpec?: Partial<ITextGraphicAttribute>,
  option?: Partial<ITextMeasureOption>,
  useNaiveCanvas?: boolean,
  defaultFontParams?: Partial<ITextGraphicAttribute>
): TextMeasure<ITextGraphicAttribute> => {
  return new TextMeasure<ITextGraphicAttribute>(
    {
      defaultFontParams: {
        fontFamily: DEFAULT_TEXT_FONT_FAMILY,
        fontSize: DEFAULT_TEXT_FONT_SIZE,
        ...defaultFontParams
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
  return getTextType(attributes, typeKey) === 'rich';
}

export function getTextType(attributes: TextContent, typeKey = 'type') {
  if (isObject(attributes.text) && 'type' in attributes.text) {
    return attributes.text.type ?? 'text';
  }

  if (typeKey in attributes) {
    return attributes[typeKey] ?? 'text';
  }

  return 'text';
}

export function richTextAttributeTransform(attributes: ITextGraphicAttribute & IRichTextAttribute & TextContent) {
  if (isValid(attributes.maxLineWidth)) {
    attributes.maxWidth = attributes.maxLineWidth;
    delete attributes.maxLineWidth;
  }

  attributes.width = attributes.width ?? 0;
  attributes.height = attributes.height ?? 0;
  attributes.textConfig = (attributes.text as unknown as any).text || attributes.text;
  return attributes;
}

export function htmlAttributeTransform(attributes: ITextGraphicAttribute) {
  const { text, _originText } = attributes as unknown as HTMLTextContent;
  const { text: html } = text;

  attributes.html = html;
  attributes.text = _originText;
  attributes.renderable = false; // 文字图元配置了 html，则不绘制原始文字
  return attributes;
}

export function reactAttributeTransform(attributes: ITextGraphicAttribute) {
  const { text, _originText } = attributes as unknown as ReactTextContent;
  const { text: react } = text;

  attributes.react = react;
  attributes.text = _originText;
  attributes.renderable = false; // 文字图元配置了 react，则不绘制原始文字

  return attributes;
}

export function createTextGraphicByType(textAttributes: ITextGraphicAttribute, typeKey = 'type') {
  const textType = getTextType(textAttributes, typeKey);
  if (textType === 'rich') {
    return graphicCreator.richtext(richTextAttributeTransform(textAttributes as IRichTextAttribute));
  }

  if (textType === 'html') {
    textAttributes = htmlAttributeTransform(textAttributes);
  } else if (textType === 'react') {
    textAttributes = reactAttributeTransform(textAttributes);
  }

  return graphicCreator.text(textAttributes as ITextGraphicAttribute);
}

export function alignTextInLine(
  layoutAlign: 'left' | 'right',
  graphic: IText | IRichText,
  textAlign: TextAlignType,
  pos: number,
  textWidth: number
) {
  if (layoutAlign === 'right') {
    if (textAlign === 'center') {
      graphic.setAttribute('x', pos - textWidth / 2);
    } else if (textAlign === 'right' || textAlign === 'end') {
      // 右对齐
      graphic.setAttribute('x', pos);
    } else {
      // 默认左对齐
      graphic.setAttribute('x', pos - textWidth);
    }
  } else {
    if (textAlign === 'center') {
      graphic.setAttribute('x', pos + textWidth / 2);
    } else if (textAlign === 'right' || textAlign === 'end') {
      // 右对齐
      graphic.setAttribute('x', pos + textWidth);
    } else {
      // 默认左对齐
      graphic.setAttribute('x', pos);
    }
  }
}
