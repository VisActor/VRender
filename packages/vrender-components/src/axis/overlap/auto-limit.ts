/**
 * 自动省略
 */
import type { IText } from '@visactor/vrender-core';
import { isEmpty, isNil, isValidNumber } from '@visactor/vutils';
import { borderPoint } from './util';

type LimitConfig = {
  orient: string;
  limitLength: number;
  axisLength: number;
  verticalLimitLength?: number;
  ellipsis?: string;
};

export function autoLimit(labels: IText[], config: LimitConfig) {
  const { limitLength, verticalLimitLength, ellipsis = '...', orient, axisLength } = config;
  if (isEmpty(labels) || !isValidNumber(limitLength)) {
    return;
  }

  labels.forEach(label => {
    const angle = label.attribute.angle;

    const hasAngle = !isNil(angle);
    const isHorizontal = !hasAngle || angle === 0 || angle === Math.PI;
    const isVertical = hasAngle && (angle === Math.PI / 2 || angle === (Math.PI * 2) / 3);
    const isX = orient === 'top' || orient === 'bottom';

    if (isX) {
      if (isVertical && Math.floor(label.AABBBounds.height()) <= limitLength) {
        return;
      }
      if (isHorizontal && Math.floor(label.AABBBounds.width()) <= verticalLimitLength) {
        return;
      }
    }

    const direction = label.attribute.direction;
    if (!isX) {
      if (direction === 'vertical' && Math.floor(label.AABBBounds.height()) <= verticalLimitLength) {
        return;
      }

      if (direction !== 'vertical') {
        if (isHorizontal && Math.floor(label.AABBBounds.width()) <= limitLength) {
          return;
        }
        if (isVertical && Math.floor(label.AABBBounds.height()) <= verticalLimitLength) {
          return;
        }
      }
    }

    // 如果水平并且文本未发生旋转，则不配置 maxLineWidth
    let limitLabelLength = null;

    if (!isHorizontal && !isVertical) {
      const { x1: x, y1: y } = label.AABBBounds;

      const width = isX ? axisLength : limitLength;
      const height = isX ? limitLength : axisLength;

      const intersection = borderPoint({ width, height, left: 0, top: 0 }, { x, y }, label.attribute.angle);
      if (intersection) {
        const { x: _x, y: _y } = intersection;
        limitLabelLength = Math.floor(Math.sqrt((_x - x) ** 2 + (_y - y) ** 2));
      } else {
        limitLabelLength = Math.abs(limitLength / Math.sin(angle));
      }
    } else if (isX) {
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
