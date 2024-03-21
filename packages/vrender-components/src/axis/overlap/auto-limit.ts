/**
 * 自动省略
 */
import type { IText } from '@visactor/vrender-core';
import { isEmpty, isNil, isValidNumber } from '@visactor/vutils';

type LimitConfig = {
  orient: string;
  limitLength: number;
  axisLength: number;
  verticalLimitLength?: number;
  ellipsis?: string;
};

const EPS = 1e-16;

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
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      if (isX) {
        const { x1, x2 } = label.AABBBounds;

        if (cos > EPS && x1 <= axisLength && (cos * limitLength) / Math.abs(sin) + x1 > axisLength) {
          limitLabelLength = (axisLength - x1) / cos;
        } else if (cos < -EPS && x2 >= 0 && (cos * limitLength) / Math.abs(sin) + x2 < 0) {
          limitLabelLength = -x2 / cos;
        } else {
          limitLabelLength = Math.abs(limitLength / sin);
        }
      } else {
        const { y1, y2 } = label.AABBBounds;

        if (sin > EPS && y2 >= 0 && y2 - (sin * limitLength) / Math.abs(cos) < 0) {
          limitLabelLength = y2 / sin;
        } else if (sin < EPS && y1 <= axisLength && y1 - (sin * limitLength) / Math.abs(cos) > axisLength) {
          limitLabelLength = -(axisLength - y1) / sin;
        } else {
          limitLabelLength = Math.abs(limitLength / cos);
        }
      }
    } else if (isX) {
      limitLabelLength = isHorizontal ? verticalLimitLength : limitLength;
    } else {
      limitLabelLength = direction === 'vertical' || isVertical ? verticalLimitLength : limitLength;
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
