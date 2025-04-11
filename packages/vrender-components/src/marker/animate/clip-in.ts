import type { EasingType } from '@visactor/vrender-core';
import type { ArcSegment, Segment } from '../../segment';
import type { Tag } from '../../tag';
import { graphicFadeIn } from './common';
import { array } from '@visactor/vutils';

export function commonLineClipIn(
  line: Segment | ArcSegment,
  label: Tag | Tag[],
  duration: number,
  delay: number,
  easing: EasingType
) {
  const startSymbolDuration = 0.1 * duration;
  const lineDuration = 0.7 * duration;
  const endSymbolDuration = 0.1 * duration;
  const labelDuration = 0.1 * duration;

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

  // label
  array(label).forEach(labelNode => {
    const delayTime = delay + startSymbolDuration + lineDuration + endSymbolDuration;
    // text
    graphicFadeIn(labelNode.getTextShape(), delayTime, labelDuration, easing);

    // text background
    graphicFadeIn(labelNode.getBgRect(), delayTime, labelDuration, easing);
  });
}
