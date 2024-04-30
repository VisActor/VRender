import type { EasingType, IArc, IImage, ILine, IPolygon, IRichText, ISymbol } from '@visactor/vrender-core';
import type { ArcSegment, Segment } from '../../segment';
import type { Tag } from '../../tag';
import { graphicFadeIn, segmentFadeIn, tagFadeIn } from './common';

export function commonLineFadeIn(
  line: Segment | ArcSegment,
  label: Tag,
  duration: number,
  delay: number,
  easing: EasingType
) {
  segmentFadeIn(line, delay, duration, easing);
  tagFadeIn(label, delay, duration, easing);
}

export function areaFadeIn(area: IPolygon, label: Tag, duration: number, delay: number, easing: EasingType) {
  graphicFadeIn(area, delay, duration, easing);
  tagFadeIn(label, delay, duration, easing);
}

export function arcAreaFadeIn(area: IArc, label: Tag, duration: number, delay: number, easing: EasingType) {
  graphicFadeIn(area, delay, duration, easing);
  tagFadeIn(label, delay, duration, easing);
}

export function pointFadeIn(
  itemLine: Segment,
  decorativeLine: ILine,
  item: Tag | IRichText | ISymbol | IImage,
  duration: number,
  delay: number,
  easing: EasingType
) {
  segmentFadeIn(itemLine, delay, duration, easing);
  graphicFadeIn(decorativeLine, delay, duration, easing);
  if (item.getTextShape?.()) {
    // tag
    tagFadeIn(item as Tag, delay, duration, easing);
  } else {
    // symbol / richText / image
    graphicFadeIn(item, delay, duration, easing);
  }
}
