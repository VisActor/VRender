import type { IBaseScale } from '@visactor/vscale';
import type { IBoundsLike } from '@visactor/vutils';
// eslint-disable-next-line no-duplicate-imports
import { AABBBounds, degreeToRadian } from '@visactor/vutils';
import type { TextAlignType, TextBaselineType } from '@visactor/vrender-core';
import { initTextMeasure } from '../../util/text';
import type { ICartesianTickDataOpt, ILabelItem, IOrientType, ITickData } from '../type';

export const convertDomainToTickData = (domain: any[]): ITickData[] => {
  const ticks = domain.map((t: number, index: number) => {
    return {
      index,
      value: t
    };
  });
  return ticks;
};

/** 判断两个label是否有重叠情况 */
export const labelOverlap = (prevLabel: AABBBounds, nextLabel: AABBBounds, gap = 0): boolean => {
  const prevBounds = new AABBBounds(prevLabel).expand(gap / 2);
  const nextBounds = new AABBBounds(nextLabel).expand(gap / 2);
  return prevBounds.intersects(nextBounds);
};

/** 判断两个不相交的label相隔的距离 */
export const labelDistance = (prevLabel: AABBBounds, nextLabel: AABBBounds): [number, number] => {
  let horizontal = 0;
  if (prevLabel.x2 < nextLabel.x1) {
    horizontal = nextLabel.x1 - prevLabel.x2;
  } else if (nextLabel.x2 < prevLabel.x1) {
    horizontal = prevLabel.x1 - nextLabel.x2;
  }

  let vertical = 0;
  if (prevLabel.y2 < nextLabel.y1) {
    vertical = nextLabel.y1 - prevLabel.y2;
  } else if (nextLabel.y2 < prevLabel.y1) {
    vertical = prevLabel.y1 - nextLabel.y2;
  }

  return [horizontal, vertical];
};

export function intersect(a: IBoundsLike, b: IBoundsLike, sep: number) {
  return sep > Math.max(b.x1 - a.x2, a.x1 - b.x2, b.y1 - a.y2, a.y1 - b.y2);
}

export function hasOverlap<T>(items: ILabelItem<T>[], pad: number): boolean {
  for (let i = 1, n = items.length, a = items[0], b; i < n; a = b, ++i) {
    b = items[i];
    if (intersect(a.AABBBounds, b.AABBBounds, pad)) {
      return true;
    }
  }
  return false;
}

export const MIN_TICK_GAP = 12;

const calculateFlushPos = (basePosition: number, size: number, rangePosition: number, otherEnd: number) => {
  return rangePosition < basePosition
    ? Math.max(basePosition - size / 2, rangePosition)
    : rangePosition > basePosition
    ? Math.min(basePosition - size / 2, rangePosition - size)
    : rangePosition < otherEnd
    ? rangePosition
    : rangePosition - size;
};

export const getCartesianLabelBounds = (scale: IBaseScale, domain: any[], op: ICartesianTickDataOpt): AABBBounds[] => {
  const { labelStyle, axisOrientType, labelFlush, labelFormatter, startAngle = 0 } = op;
  let labelAngle = labelStyle.angle ?? 0;
  if (labelStyle.direction === 'vertical') {
    labelAngle += degreeToRadian(90);
  }
  const isHorizontal = ['bottom', 'top'].includes(axisOrientType);
  const isVertical = ['left', 'right'].includes(axisOrientType);
  let scaleX = 1;
  let scaleY = 0;
  if (isHorizontal) {
    // nothing to update
  } else if (isVertical) {
    scaleX = 0;
    scaleY = 1;
  } else if (startAngle) {
    scaleX = Math.cos(startAngle);
    scaleY = -Math.sin(startAngle);
  }

  const textMeasure = initTextMeasure(labelStyle);
  const range = scale.range();
  const labelBoundsList = domain.map((v: any, i: number) => {
    const str = labelFormatter ? labelFormatter(v) : `${v}`;

    // 估算文本宽高
    const { width, height } = textMeasure.quickMeasure(str);
    const textWidth = Math.max(width, MIN_TICK_GAP);
    const textHeight = Math.max(height, MIN_TICK_GAP);

    // 估算文本位置
    const pos = scale.scale(v);
    const baseTextX = scaleX * pos;
    const baseTextY = scaleY * pos;
    let textX = baseTextX;
    let textY = baseTextY;

    let align: TextAlignType;
    if (labelFlush && isHorizontal && i === 0) {
      textX = calculateFlushPos(baseTextX, textWidth, range[0], range[range.length - 1]);
    } else if (labelFlush && isHorizontal && i === domain.length - 1) {
      textX = calculateFlushPos(baseTextX, textWidth, range[range.length - 1], range[0]);
    } else {
      align = labelStyle.textAlign ?? 'center';
    }
    if (align === 'right') {
      textX -= textWidth;
    } else if (align === 'center') {
      textX -= textWidth / 2;
    }

    let baseline: TextBaselineType;
    if (labelFlush && isVertical && i === 0) {
      textY = calculateFlushPos(baseTextY, textHeight, range[0], range[range.length - 1]);
    } else if (labelFlush && isVertical && i === domain.length - 1) {
      textY = calculateFlushPos(baseTextY, textHeight, range[range.length - 1], range[0]);
    } else {
      baseline = labelStyle.textBaseline ?? 'middle';
    }
    if (baseline === 'bottom') {
      textY -= textHeight;
    } else if (baseline === 'middle') {
      textY -= textHeight / 2;
    }

    // 计算 label 包围盒
    const bounds = new AABBBounds().set(textX, textY, textX + textWidth, textY + textHeight);

    if (labelAngle) {
      bounds.rotate(labelAngle, baseTextX, baseTextY);
    }

    return bounds;
  });

  return labelBoundsList;
};

export const isAxisHorizontal = (axisOrientType: IOrientType) => {
  return (['bottom', 'top', 'z'] as IOrientType[]).includes(axisOrientType);
};
