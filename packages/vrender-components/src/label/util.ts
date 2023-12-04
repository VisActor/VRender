import type { IArea, ILine } from '@visactor/vrender/es/core';
import type { IPolarPoint, IPoint, Quadrant } from './type';
import type { IBoundsLike, IPointLike } from '@visactor/vutils';
import { radianToDegree, isValidNumber } from '@visactor/vutils';

/**
 * 极坐标系 -> 直角坐标系
 * @param point
 * @returns
 */
export function polarToCartesian(point: IPolarPoint): IPoint {
  if (!point.radius) {
    return { x: 0, y: 0 };
  }
  return {
    x: Math.cos(point.angle) * point.radius,
    y: Math.sin(point.angle) * point.radius
  };
}

/**
 * 计算圆弧上的点坐标
 * @param x0 圆心 x 坐标
 * @param y0 圆心 y 坐标
 * @param radius 圆弧半径
 * @param radian 点所在弧度
 */
export function circlePoint(x0: number, y0: number, radius: number, radian: number): IPoint {
  const offset = polarToCartesian({
    radius,
    angle: radian
  });
  return {
    x: x0 + offset.x,
    y: y0 + offset.y
  };
}

/**
 * 根据角度计算象限
 * 计算角度所在象限
 * @param angle
 * @returns
 */
export function computeQuadrant(angle: number): Quadrant {
  angle = normalizeAngle(angle);
  if (angle > 0 && angle <= Math.PI / 2) {
    return 2;
  } else if (angle > Math.PI / 2 && angle <= Math.PI) {
    return 3;
  } else if (angle > Math.PI && angle <= (3 * Math.PI) / 2) {
    return 4;
  }
  return 1;
}

/**
 * 角度标准化处理
 * @param angle 弧度角
 */
export function normalizeAngle(angle: number): number {
  while (angle < 0) {
    angle += Math.PI * 2;
  }
  while (angle >= Math.PI * 2) {
    angle -= Math.PI * 2;
  }
  return angle;
}

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
    return;
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
