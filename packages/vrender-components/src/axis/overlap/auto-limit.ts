/**
 * 自动省略
 */
import type { IText } from '@visactor/vrender-core';
import { isEmpty, isNil, isValidNumber } from '@visactor/vutils';

type LimitConfig = {
  orient: string;
  limitLength: number;
  verticalLimitLength?: number;
  ellipsis?: string;
};

export function autoLimit(labels: IText[], config: LimitConfig) {
  const { limitLength, verticalLimitLength, ellipsis = '...', orient } = config;

  if (isEmpty(labels) || !isValidNumber(limitLength)) {
    return;
  }

  labels.forEach(label => {
    const angle = label.attribute.angle;
    const isRotated = !isNil(angle) && angle !== 0;

    if (
      (orient === 'top' || orient === 'bottom') &&
      ((isRotated && Math.floor(label.AABBBounds.height()) <= limitLength) ||
        (!isRotated && Math.floor(label.AABBBounds.width()) <= verticalLimitLength))
    ) {
      return;
    }
    const direction = label.attribute.direction;
    if (
      (orient === 'left' || orient === 'right') &&
      ((direction === 'vertical' && Math.floor(label.AABBBounds.height()) <= verticalLimitLength) ||
        (direction !== 'vertical' && Math.floor(label.AABBBounds.width()) <= limitLength))
    ) {
      return;
    }

    // 如果水平并且文本未发生旋转，则不配置 maxLineWidth
    let limitLabelLength = null;

    if (isRotated) {
      limitLabelLength = Math.abs(limitLength / Math.sin(angle));
    } else if (orient === 'top' || orient === 'bottom') {
      limitLabelLength = verticalLimitLength;
    } else {
      limitLabelLength = direction === 'vertical' ? verticalLimitLength : limitLength;
    }

    if (isValidNumber(label.attribute.maxLineWidth)) {
      limitLabelLength = isValidNumber(limitLabelLength)
        ? Math.min(label.attribute.maxLineWidth, limitLabelLength)
        : label.attribute.maxLineWidth;
    }
    label.setAttributes({
      maxLineWidth: limitLabelLength,
      ellipsis: label.attribute.ellipsis ?? ellipsis
    });
  });
}
