/**
 * 自动省略
 */

import type { IText } from '@visactor/vrender';
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
    // 如果水平并且文本未发生旋转，则不配置 maxLineWidth
    const limitLabelLength =
      label.attribute.angle === 0 || isNil(label.attribute.angle)
        ? orient === 'top' || orient === 'bottom'
          ? null
          : limitLength
        : limitLength / Math.sin(label.attribute.angle);
    label.setAttributes({
      maxLineWidth: limitLabelLength,
      ellipsis
    });
  });
}
