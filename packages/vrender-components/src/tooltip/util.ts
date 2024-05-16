import { array, isNil, merge } from '@visactor/vutils';
import type { IRichTextGraphicAttribute } from '@visactor/vrender-core';
import type { TooltipRowAttrs, TooltipRowStyleAttrs, TooltipTextAttrs, TooltipRichTextAttrs } from './type';
import type { IRichTextCharacter } from '@visactor/vrender-core';

export const mergeRowAttrs = (
  target: TooltipRowAttrs | TooltipRowStyleAttrs,
  ...sources: (TooltipRowAttrs | TooltipRowStyleAttrs)[]
): TooltipRowAttrs | TooltipRowStyleAttrs => {
  const shapeList = [target.shape, ...sources.map(s => s?.shape)];
  const keyList = [target.key, ...sources.map(s => s?.key)];
  const valueList = [target.value, ...sources.map(s => s?.value)];

  return merge(target, ...sources, {
    shape: shapeList.every(isNil) ? undefined : merge({}, ...shapeList),
    key: keyList.every(isNil) ? undefined : merge({}, ...keyList),
    value: valueList.every(isNil) ? undefined : merge({}, ...valueList)
  }) as TooltipRowAttrs | TooltipRowStyleAttrs;
};

export const getRichTextAttribute = (attr: TooltipTextAttrs): IRichTextGraphicAttribute => {
  const { width, height, wordBreak = 'break-word', textAlign, textBaseline, text } = attr;
  if (Array.isArray(text)) {
    return {
      width,
      height,
      wordBreak: wordBreak as any,
      textAlign: textAlign as any,
      textBaseline: textBaseline as any,
      singleLine: false,
      textConfig: array(text as string[]).map(
        text =>
          ({
            ...attr,
            text
          } as any)
      )
    };
  }
  return {
    width,
    height,
    wordBreak: wordBreak as any,
    textAlign: textAlign as any,
    textBaseline: textBaseline as any,
    singleLine: false,
    textConfig: (text as TooltipRichTextAttrs)?.text as IRichTextCharacter[]
  };
};
