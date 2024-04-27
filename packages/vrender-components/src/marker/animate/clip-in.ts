import type { EasingType } from '@visactor/vrender-core';
import type { ArcSegment, Segment } from '../../segment';
import type { Tag } from '../../tag';
import { graphicFadeIn } from './common';
import {
  CLIP_IN_END_SYMBOL_DURATION,
  CLIP_IN_LABEL_DURATION,
  CLIP_IN_LINE_DRATION,
  CLIP_IN_START_SYMBOL_DRUATION
} from './constant';

export function commonLineClipIn(
  line: Segment | ArcSegment,
  label: Tag,
  duration: number,
  delay: number,
  easing: EasingType
) {
  const startSymbolDuration = CLIP_IN_START_SYMBOL_DRUATION * duration;
  const lineDuration = CLIP_IN_LINE_DRATION * duration;
  const endSymbolDuration = CLIP_IN_END_SYMBOL_DURATION * duration;
  const labelDuration = CLIP_IN_LABEL_DURATION * duration;

  // start symbol
  graphicFadeIn(line.startSymbol, delay, startSymbolDuration, easing);

  // line
  line.lines.forEach(line => line.setAttribute('clipRange', 0));
  line.lines.forEach((l, index) => {
    const stepDuration = lineDuration / line.lines.length;
    l.animate()
      .wait(delay + startSymbolDuration + index * stepDuration)
      .to({ clipRange: 1 }, stepDuration, easing);
  });

  // end symbol
  graphicFadeIn(line.endSymbol, delay + startSymbolDuration + lineDuration, endSymbolDuration, easing);

  // text
  graphicFadeIn(
    label.getTextShape(),
    delay + startSymbolDuration + lineDuration + endSymbolDuration,
    labelDuration,
    easing
  );

  // text background
  graphicFadeIn(
    label.getBgRect(),
    delay + startSymbolDuration + lineDuration + endSymbolDuration,
    labelDuration,
    easing
  );
}
