import type { IArea, ILine } from '@visactor/vrender-core';
import type { IPoint, Quadrant } from './type';
import type { IBoundsLike, IPointLike } from '@visactor/vutils';
import { radianToDegree, isValidNumber, isRectIntersect, normalizeAngle, polarToCartesian } from '@visactor/vutils';

export function isQuadrantLeft(quadrant: Quadrant): boolean {
  return quadrant === 3 || quadrant === 4;
}

export function isQuadrantRight(quadrant: Quadrant): boolean {
  return quadrant === 1 || quadrant === 2;
}

/**
 * 计算直线与圆交点
 * 直线方程：ax + by + c = 0
 * 圆方程：(x - x0)^2 + (y - y0)^2 = r^2
 */
export function lineCirclePoints(a: number, b: number, c: number, x0: number, y0: number, r: number): IPoint[] {
  if ((a === 0 && b === 0) || r <= 0) {
    return [];
  }
  if (a === 0) {
    const y1 = -c / b;
    const fy = (y1 - y0) ** 2;
    const fd = r ** 2 - fy;
    if (fd < 0) {
      return [];
    } else if (fd === 0) {
      return [{ x: x0, y: y1 }];
    }
    const x1 = Math.sqrt(fd) + x0;
    const x2 = -Math.sqrt(fd) + x0;
    return [
      { x: x1, y: y1 },
      { x: x2, y: y1 }
    ];
  } else if (b === 0) {
    const x1 = -c / a;
    const fx = (x1 - x0) ** 2;
    const fd = r ** 2 - fx;
    if (fd < 0) {
      return [];
    } else if (fd === 0) {
      return [{ x: x1, y: y0 }];
    }
    const y1 = Math.sqrt(fd) + y0;
    const y2 = -Math.sqrt(fd) + y0;
    return [
      { x: x1, y: y1 },
      { x: x1, y: y2 }
    ];
  }
  const fa = (b / a) ** 2 + 1;
  const fb = 2 * ((c / a + x0) * (b / a) - y0);
  const fc = (c / a + x0) ** 2 + y0 ** 2 - r ** 2;
  const fd = fb ** 2 - 4 * fa * fc;
  if (fd < 0) {
    return [];
  }
  const y1 = (-fb + Math.sqrt(fd)) / (2 * fa);
  const y2 = (-fb - Math.sqrt(fd)) / (2 * fa);
  const x1 = -(b * y1 + c) / a;
  const x2 = -(b * y2 + c) / a;
  if (fd === 0) {
    return [{ x: x1, y: y1 }];
  }
  return [
    { x: x1, y: y1 },
    { x: x2, y: y2 }
  ];
}

/**
 * 根据圆弧两点连接线长度计算弧度
 * @param radius 圆弧半径
 * @param length 连接线长度
 */
export function connectLineRadian(radius: number, length: number) {
  if (length > radius * 2) {
    return NaN;
  }
  return Math.asin(length / 2 / radius) * 2;
}

export function checkBoundsOverlap(boundsA: IBoundsLike, boundsB: IBoundsLike): boolean {
  const { x1: ax1, y1: ay1, x2: ax2, y2: ay2 } = boundsA;
  const { x1: bx1, y1: by1, x2: bx2, y2: by2 } = boundsB;
  return !(
    (ax1 <= bx1 && ax2 <= bx1) ||
    (ax1 >= bx2 && ax2 >= bx2) ||
    (ay1 <= by1 && ay2 <= by1) ||
    (ay1 >= by2 && ay2 >= by2)
  );
}

export const degrees = (angle?: number) => {
  if (!isValidNumber(angle)) {
    return null;
  }
  return radianToDegree(angle);
};

export const labelingPoint = (textBounds: IBoundsLike, graphicBounds: IBoundsLike, position = 'top', offset = 0) => {
  if (!textBounds) {
    return;
  }

  const { x1, y1, x2, y2 } = textBounds;
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);

  const anchorX = (graphicBounds.x1 + graphicBounds.x2) / 2;
  const anchorY = (graphicBounds.y1 + graphicBounds.y2) / 2;

  let sx = 0;
  let sy = 0;
  let offsetX = 0;
  let offsetY = 0;
  if (graphicBounds) {
    offsetX = Math.abs(graphicBounds.x1 - graphicBounds.x2) / 2;
    offsetY = Math.abs(graphicBounds.y1 - graphicBounds.y2) / 2;
  }

  const angle = {
    'top-right': -235,
    'top-left': 235,
    'bottom-right': 45,
    'bottom-left': -45
  };

  switch (position) {
    case 'top':
      sy = -1;
      break;
    case 'bottom':
      sy = 1;
      break;
    case 'left':
      sx = -1;
      break;
    case 'right':
      sx = 1;
      break;
    case 'bottom-left':
    case 'bottom-right':
    case 'top-left':
    case 'top-right':
      sx = Math.sin(angle[position] * (Math.PI / 180));
      sy = Math.cos(angle[position] * (Math.PI / 180));
      break;
    case 'center':
      sx = 0;
      sy = 0;
      break;
  }

  const x = anchorX + sx * (offset + offsetX) + Math.sign(sx) * (width / 2);
  const y = anchorY + sy * (offset + offsetY) + Math.sign(sy) * (height / 2);

  return { x, y };
};

export const getPointsOfLineArea = (graphic: ILine | IArea): IPointLike[] => {
  if (!graphic || !graphic.attribute) {
    return [];
  }

  const { points, segments } = graphic.attribute;

  if (segments && segments.length) {
    const res: IPointLike[] = [];

    segments.forEach(seg => {
      const segPoints = seg.points;

      segPoints.forEach(point => {
        res.push(point);
      });
    });

    return res;
  }

  return points;
};

export function labelingLineOrArea(
  textBounds: IBoundsLike,
  graphicBounds: IBoundsLike,
  position: string = 'end',
  offset = 0
) {
  if (!textBounds || !graphicBounds) {
    return { x: Infinity, y: Infinity };
  }

  const { x1, x2 } = textBounds;
  const width = Math.abs(x2 - x1);

  const anchorX = graphicBounds.x1;
  const anchorY = graphicBounds.y1;

  let x = anchorX;
  const y = anchorY;

  if (position === 'end') {
    x = anchorX + width / 2 + offset;
  } else if (position === 'start') {
    x = anchorX - width / 2 - offset;
  }

  return { x, y };
}

export function connectLineBetweenBounds(boundA: IBoundsLike, boundB: IBoundsLike) {
  if (!boundA || !boundB) {
    return;
  }

  if (isRectIntersect(boundA, boundB, true)) {
    return;
  }
  // Top left coordinates
  const x1 = Math.min(boundA.x1, boundA.x2);
  const y1 = Math.min(boundA.y1, boundA.y2);
  const x2 = Math.min(boundB.x1, boundB.x2);
  const y2 = Math.min(boundB.y1, boundB.y2);

  // Half widths and half heights
  const w1 = Math.abs(boundA.x2 - x1) / 2;
  const h1 = Math.abs(boundA.y2 - y1) / 2;
  const w2 = Math.abs(boundB.x2 - x2) / 2;
  const h2 = Math.abs(boundB.y2 - y2) / 2;

  // Center coordinates
  const cx1 = x1 + w1;
  const cy1 = y1 + h1;
  const cx2 = x2 + w2;
  const cy2 = y2 + h2;

  // Distance between centers
  const dx = cx2 - cx1;
  const dy = cy2 - cy1;

  const p1 = getIntersection(dx, dy, cx1, cy1, w1, h1);
  const p2 = getIntersection(-dx, -dy, cx2, cy2, w2, h2);

  return [p1, p2];
}

function getIntersection(dx: number, dy: number, cx: number, cy: number, w: number, h: number) {
  if (Math.abs(dy / dx) < h / w) {
    // Hit vertical edge of box1
    return { x: cx + (dx > 0 ? w : -w), y: cy + (dy * w) / Math.abs(dx) };
  }
  // Hit horizontal edge of box1
  return { x: cx + (dx * h) / Math.abs(dy), y: cy + (dy > 0 ? h : -h) };
}

export function getAlignOffset(align: 'left' | 'right' | 'center') {
  if (align === 'left') {
    return 0;
  } else if (align === 'right') {
    return 1;
  }

  return 0.5;
}
