import type { IText } from '@visactor/vrender-core';
import { isEmpty, isValidNumber } from '@visactor/vutils';
import { isAngleHorizontal, isAngleVertical } from './util';

type WrapConfig = {
  orient: string;
  limitLength: number;
  axisLength: number;
  ellipsis?: string;
};

export function autoWrap(labels: IText[], config: WrapConfig) {
  const { limitLength, axisLength, ellipsis = '...', orient } = config;
  if (isEmpty(labels) || !isValidNumber(limitLength)) {
    return;
  }

  const verticalLimitLength = axisLength / labels.length;

  labels.forEach(label => {
    const angle = label.attribute.angle;

    const isHorizontal = isAngleHorizontal(angle);
    const isVertical = isAngleVertical(angle);
    const isX = orient === 'top' || orient === 'bottom';

    if (isX) {
      if (isVertical && Math.floor(label.AABBBounds.height()) <= limitLength) {
        return;
      }
      if (isHorizontal && Math.floor(label.AABBBounds.width()) <= verticalLimitLength) {
        return;
      }
    }

    if (!isX) {
      if (isVertical && Math.floor(label.AABBBounds.height()) <= verticalLimitLength) {
        return;
      }
      if (isHorizontal && Math.floor(label.AABBBounds.width()) <= limitLength) {
        return;
      }
    }
    let limitLabelLength = null;
    let heightLimit = null;

    if (isX) {
      if (isVertical) {
        limitLabelLength = limitLength;
        heightLimit = verticalLimitLength;
      } else {
        limitLabelLength = verticalLimitLength;
        heightLimit = limitLength;
      }
    } else {
      if (isVertical) {
        limitLabelLength = verticalLimitLength;
        heightLimit = limitLength;
      } else {
        limitLabelLength = limitLength;
        heightLimit = verticalLimitLength;
      }
    }

    label.setAttributes({
      maxLineWidth: limitLabelLength,
      ellipsis: label.attribute.ellipsis ?? ellipsis,
      whiteSpace: 'normal',
      heightLimit
    });
  });
}
