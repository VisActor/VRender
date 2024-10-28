import type { IText } from '@visactor/vrender-core';
import { isEmpty, isValidNumber, min } from '@visactor/vutils';
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

  // 注意：自动换行算法暂时只考虑所有标签角度都一致的情况
  const firstLabel = labels[0];
  const angle = firstLabel.attribute.angle;
  const isHorizontal = isAngleHorizontal(angle);
  const isVertical = isAngleVertical(angle);
  const isX = orient === 'top' || orient === 'bottom';

  let verticalLimitLength = axisLength / labels.length;

  labels.forEach((label, index) => {
    if (isX) {
      if (isVertical && Math.floor(label.AABBBounds.height()) <= limitLength) {
        return;
      }
      if (isHorizontal) {
        const curLabelX = label.attribute.x;
        const nextLabelX = labels[index + 1]?.attribute.x;
        const lastLabelX = labels[index - 1]?.attribute.x;
        const minGap = getLabelMinGap(curLabelX, nextLabelX, lastLabelX);
        if (isValidNumber(minGap)) {
          verticalLimitLength = min(verticalLimitLength, minGap);
        }
      }
    } else {
      if (isVertical) {
        const curLabelY = label.attribute.y;
        const nextLabelY = labels[index + 1]?.attribute.y;
        const lastLabelY = labels[index - 1]?.attribute.y;
        const minGap = getLabelMinGap(curLabelY, nextLabelY, lastLabelY);
        if (isValidNumber(minGap)) {
          verticalLimitLength = min(verticalLimitLength, minGap);
        }
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

function getLabelMinGap(current: number, next?: number, prev?: number) {
  let minGap;
  if (isValidNumber(next)) {
    minGap = Math.abs(next - current);
  }

  if (isValidNumber(prev)) {
    if (isValidNumber(minGap)) {
      minGap = Math.min(Math.abs(current - prev), minGap);
    } else {
      minGap = Math.abs(current - prev);
    }
  }

  return minGap;
}
