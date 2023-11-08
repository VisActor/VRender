/**
 * 自动省略
 */
import type { IText } from '@visactor/vrender-core';
import { isEmpty, isNil, isValidNumber } from '@visactor/vutils';

type LimitConfig = {
  orient: string;
  limitLength: number;
  ellipsis?: string;
};

export function autoLimit(labels: IText[], config: LimitConfig) {
  const { limitLength, ellipsis = '...', orient } = config;

  if (isEmpty(labels) || !isValidNumber(limitLength)) {
    return;
  }

  labels.forEach(label => {
    if ((orient === 'top' || orient === 'bottom') && Math.floor(label.AABBBounds.height()) <= limitLength) {
      return;
    }
    if ((orient === 'left' || orient === 'right') && Math.floor(label.AABBBounds.width()) <= limitLength) {
      return;
    }

    // 如果水平并且文本未发生旋转，则不配置 maxLineWidth
    let limitLabelLength =
      label.attribute.angle === 0 || isNil(label.attribute.angle)
        ? orient === 'top' || orient === 'bottom'
          ? null
          : limitLength
        : Math.abs(limitLength / Math.sin(label.attribute.angle));
    if (isValidNumber(label.attribute.maxLineWidth)) {
      limitLabelLength = isValidNumber(limitLabelLength)
        ? Math.min(label.attribute.maxLineWidth, limitLabelLength)
        : label.attribute.maxLineWidth;
    }
    label.setAttributes({
      maxLineWidth: limitLabelLength,
      ellipsis: label.attribute.ellipsis || ellipsis
    });
  });
}
