import type { EasingType, IArc, IImage, ILine, IPolygon, IRichText, ISymbol } from '@visactor/vrender-core';
import type { ArcSegment, Segment } from '../../segment';
import type { Tag } from '../../tag';
import { graphicFadeOut, segmentFadeOut, tagFadeOut } from './common';

export function commonLineFadeOut(
  line: Segment | ArcSegment,
  label: Tag,
  duration: number,
  delay: number,
  easing: EasingType
) {
  segmentFadeOut(line, delay, duration, easing);
  tagFadeOut(label, delay, duration, easing);
}

export function areaFadeOut(area: IPolygon, label: Tag, duration: number, delay: number, easing: EasingType) {
  graphicFadeOut(area, delay, duration, easing);
  tagFadeOut(label, delay, duration, easing);
}

export function arcAreaFadeOut(area: IArc, label: Tag, duration: number, delay: number, easing: EasingType) {
  graphicFadeOut(area, delay, duration, easing);
  tagFadeOut(label, delay, duration, easing);
}

export function pointFadeOut(
  itemLine: Segment,
  decorativeLine: ILine,
  item: Tag | IRichText | ISymbol | IImage,
  duration: number,
  delay: number,
  easing: EasingType
) {
  segmentFadeOut(itemLine, delay, duration, easing);
  graphicFadeOut(decorativeLine, delay, duration, easing);
  if (item.getTextShape?.()) {
    // tag
    tagFadeOut(item as Tag, delay, duration, easing);
  } else {
    // symbol / richText / image
    graphicFadeOut(item, delay, duration, easing);
  }
}
