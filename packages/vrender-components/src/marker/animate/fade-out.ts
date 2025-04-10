import type { EasingType, IArc, IImage, ILine, IPolygon, IRichText, ISymbol } from '@visactor/vrender-core';
import type { ArcSegment, Segment } from '../../segment';
import type { Tag } from '../../tag';
import { graphicFadeOut, segmentFadeOut, tagFadeOut } from './common';
import { array } from '@visactor/vutils';

export function commonLineFadeOut(
  line: Segment | ArcSegment,
  label: Tag | Tag[],
  duration: number,
  delay: number,
  easing: EasingType
) {
  segmentFadeOut(line, delay, duration, easing);

  // label
  array(label).forEach(labelNode => {
    tagFadeOut(labelNode, delay, duration, easing);
  });
}

export function areaFadeOut(area: IPolygon, label: Tag | Tag[], duration: number, delay: number, easing: EasingType) {
  graphicFadeOut(area, delay, duration, easing);
  array(label).forEach(labelNode => {
    tagFadeOut(labelNode, delay, duration, easing);
  });
}

export function arcAreaFadeOut(area: IArc, label: Tag | Tag[], duration: number, delay: number, easing: EasingType) {
  graphicFadeOut(area, delay, duration, easing);
  array(label).forEach(labelNode => {
    tagFadeOut(labelNode, delay, duration, easing);
  });
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
