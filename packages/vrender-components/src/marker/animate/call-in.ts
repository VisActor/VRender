import type { EasingType, IImage, ILine, IRichText, ISymbol } from '@visactor/vrender-core';
import type { Segment } from '../../segment';
import type { Tag } from '../../tag';
import { graphicFadeIn } from './common';

export function pointCallIn(
  itemLine: Segment,
  decorativeLine: ILine,
  item: Tag | IRichText | ISymbol | IImage,
  duration: number,
  delay: number,
  easing: EasingType
) {
  const startSymbolDuration = 0.1 * duration;
  const lineDuration = 0.65 * duration;
  const decorativeDuration = 0.05 * duration;
  const endSymbolDuration = 0.1 * duration;
  const labelDuration = 0.1 * duration;

  // start symbol
  graphicFadeIn(itemLine.startSymbol, delay, startSymbolDuration, easing);

  // line
  itemLine.lines.forEach(line => line.setAttribute('clipRange', 0));
  itemLine.lines.forEach((l, index) => {
    const stepDuration = lineDuration / itemLine.lines.length;
    l.animate()
      .wait(delay + startSymbolDuration + index * stepDuration)
      .to({ clipRange: 1 }, stepDuration, easing);
  });

  graphicFadeIn(decorativeLine, delay + startSymbolDuration + lineDuration, decorativeDuration, easing);

  // end symbol
  graphicFadeIn(
    itemLine.endSymbol,
    delay + startSymbolDuration + lineDuration + decorativeDuration,
    endSymbolDuration,
    easing
  );

  if (item.getTextShape?.()) {
    // text
    graphicFadeIn(
      item.getTextShape(),
      delay + startSymbolDuration + lineDuration + decorativeDuration + endSymbolDuration,
      labelDuration,
      easing
    );

    // text background
    graphicFadeIn(
      item.getBgRect(),
      delay + startSymbolDuration + lineDuration + endSymbolDuration,
      labelDuration,
      easing
    );
  } else {
    graphicFadeIn(item, delay + startSymbolDuration + lineDuration + endSymbolDuration, labelDuration, easing);
  }
}
