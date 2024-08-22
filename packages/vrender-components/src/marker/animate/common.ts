import type { EasingType, IGraphic } from '@visactor/vrender-core';
import type { ArcSegment, Segment } from '../../segment';
import type { Tag } from '../../tag';

/** fade-in */
export function graphicFadeIn(graphic: IGraphic, delay: number, duration: number, easing: EasingType) {
  if (!graphic) {
    return;
  }
  graphic?.animates?.forEach(a => a.stop('end'));
  const fillOpacityConfig = graphic.attribute?.fillOpacity ?? 1;
  const strokeOpacityConfig = graphic.attribute?.strokeOpacity ?? 1;

  graphic.setAttributes({
    fillOpacity: 0,
    strokeOpacity: 0
  });

  graphic.animate().wait(delay).to(
    {
      fillOpacity: fillOpacityConfig,
      strokeOpacity: strokeOpacityConfig
    },
    duration,
    easing
  );
}

export function segmentFadeIn(segment: Segment, delay: number, duration: number, easing: EasingType) {
  if (!segment) {
    return;
  }

  // start symbol
  graphicFadeIn(segment.startSymbol, delay, duration, easing);

  // line
  segment.lines.forEach(line => graphicFadeIn(line, delay, duration, easing));
  graphicFadeIn((segment as ArcSegment).line, delay, duration, easing);

  // end symbol
  graphicFadeIn(segment.endSymbol, delay, duration, easing);
}

export function tagFadeIn(tag: Tag, delay: number, duration: number, easing: EasingType) {
  if (!tag) {
    return;
  }

  // text
  graphicFadeIn(tag.getTextShape(), delay, duration, easing);

  // text background
  graphicFadeIn(tag.getBgRect(), delay, duration, easing);
}

/** fade-out */
export function graphicFadeOut(graphic: IGraphic, delay: number, duration: number, easing: EasingType) {
  if (!graphic) {
    return;
  }

  graphic.setAttributes({
    fillOpacity: graphic.attribute?.fillOpacity ?? 1,
    strokeOpacity: graphic.attribute?.strokeOpacity ?? 1
  });

  graphic.animate().wait(delay).to({ fillOpacity: 0, strokeOpacity: 0 }, duration, easing);
}

export function segmentFadeOut(segment: Segment | ArcSegment, delay: number, duration: number, easing: EasingType) {
  if (!segment) {
    return;
  }

  // start symbol
  graphicFadeOut(segment.startSymbol, delay, duration, easing);

  // line
  segment.lines.forEach(line => graphicFadeOut(line, delay, duration, easing));
  graphicFadeOut((segment as ArcSegment).line, delay, duration, easing);

  // end symbol
  graphicFadeOut(segment.endSymbol, delay, duration, easing);
}

export function tagFadeOut(tag: Tag, delay: number, duration: number, easing: EasingType) {
  if (!tag) {
    return;
  }

  // text
  graphicFadeOut(tag.getTextShape(), delay, duration, easing);

  // text background
  graphicFadeOut(tag.getBgRect(), delay, duration, easing);
}
