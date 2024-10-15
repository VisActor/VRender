/**
 * 自动省略
 */
import type { IText } from '@visactor/vrender-core';
import { isAngleHorizontal, isAngleVertical } from './util';
import type { AxisLabelOverlap } from '../type';
import { isEmpty, isNil, isObject, isValidNumber } from '@visactor/vutils';

type LimitConfig = {
  orient: string;
  limitLength: number;
  axisLength: number;
  verticalLimitLength?: number;
  ellipsis?: string;
  overflowLimitLength?: AxisLabelOverlap['overflowLimitLength'];
};

function normalizeOverflowLimitLength(overflowLimitLength?: AxisLabelOverlap['overflowLimitLength']) {
  if (isValidNumber(overflowLimitLength)) {
    return {
      left: overflowLimitLength,
      right: overflowLimitLength
      // top: overflowLimitLength,
      // bottom: overflowLimitLength
    };
  } else if (isObject(overflowLimitLength)) {
    return {
      left: overflowLimitLength.left || 0,
      right: overflowLimitLength.right || 0
      // top: overflowLimitLength.top || 0,
      // bottom: overflowLimitLength.bottom || 0
    };
  }
  return { left: 0, right: 0 };
}

export function autoLimit(labels: IText[], config: LimitConfig) {
  const { limitLength, verticalLimitLength, ellipsis = '...', orient, axisLength } = config;
  if (isEmpty(labels) || !isValidNumber(limitLength)) {
    return;
  }
  const DELTA = Math.sin(Math.PI / 10);

  const overflowLimitLength = normalizeOverflowLimitLength(config.overflowLimitLength);

  labels.forEach(label => {
    const angle = label.attribute.angle;

    const hasAngle = !isNil(angle);
    const cos = hasAngle ? Math.cos(angle) : 1;
    const sin = hasAngle ? Math.sin(angle) : 0;
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
      if (isX) {
        const { x1, x2 } = label.AABBBounds;
        const tan = sin / cos;
        const verticalSizeLimit = Math.abs(limitLength / sin);
        if (tan > 0 && x1 <= axisLength && limitLength / tan + x1 > axisLength) {
          // 以 x1 近似为锚点，文字在 x1 右侧
          const lengthLimit = (axisLength - x1) / Math.abs(cos) + overflowLimitLength.right;
          limitLabelLength = Math.min(lengthLimit, verticalSizeLimit);
        } else if (tan < 0 && x2 >= 0 && limitLength / tan + x2 < 0) {
          // 以 x2 近似为锚点，文字在 x2 左侧
          const lengthLimit = x2 / Math.abs(cos) + overflowLimitLength.left;
          limitLabelLength = Math.min(lengthLimit, verticalSizeLimit);
        } else {
          limitLabelLength = verticalSizeLimit;
        }
      } else {
        // y轴暂时不限制在平行于坐标轴的矩形内，后续可以考虑通过配置开启
        // const { y1, y2 } = label.AABBBounds;
        // const tan = sin / cos;
        // if (tan > 0 && y2 >= 0 && y2 - tan * limitLength < 0) {
        //   limitLabelLength = y2 / Math.abs(sin);
        // } else if (tan < 0 && y1 <= axisLength && y1 - tan * limitLength > axisLength) {
        //   limitLabelLength = (axisLength - y1) / Math.abs(sin);
        // } else {
        // }
        limitLabelLength = Math.abs(limitLength / cos);
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
