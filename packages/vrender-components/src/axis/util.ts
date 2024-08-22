import { getTextBounds } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import type { IGraphic, IGroup, ITextGraphicAttribute, TextAlignType, TextBaselineType } from '@visactor/vrender-core';
import type { Dict } from '@visactor/vutils';
// eslint-disable-next-line no-duplicate-imports
import { isGreater, isLess, tau, normalizeAngle, polarToCartesian, merge } from '@visactor/vutils';
import { traverseGroup } from '../util/common';
import type { Vector2 } from '../util';
// eslint-disable-next-line no-duplicate-imports
import { scale, length } from '../util';
import type { BreakSymbol } from './type';
import { DEFAULT_AXIS_BREAK_SYMBOL_STYLE } from './config';
import type { Point } from '../core/type';

// 和 vutils 版本不同
export const clampRadian = (angle: number = 0) => {
  if (angle < 0) {
    while (angle < 0) {
      angle += tau;
    }
  } else if (angle > 0) {
    while (angle > tau) {
      angle -= tau;
    }
  }
  return angle;
};

// 判断数值是否在制定范围内，包含误差
export function isInRange(a: number, min: number, max: number) {
  return !isLess(a, min, 0, 1e-6) && !isGreater(a, max, 0, 1e-6);
}

export function getCircleLabelPosition(
  tickPosition: Point,
  tickVector: [number, number],
  text: string | number,
  style: Partial<ITextGraphicAttribute>
) {
  const labelBounds = getTextBounds({
    text,
    ...style
  });
  const width = labelBounds.width();
  const height = labelBounds.height();
  const angle = clampRadian(Math.atan2(tickVector[1], tickVector[0])) - Math.PI;

  const PI_3_4 = (Math.PI * 3) / 4;
  const PI_1_4 = Math.PI / 4;
  const PI_1_2 = Math.PI / 2;

  // x
  const baseX = tickPosition.x;
  let dx = 0;
  if (isInRange(angle, -PI_3_4, -PI_1_4)) {
    dx = ((angle + PI_3_4) / PI_1_2 - 0.5) * width;
  } else if (isInRange(angle, PI_1_4, PI_3_4)) {
    dx = (0.5 - (angle - PI_1_4) / PI_1_2) * width;
  } else if (Math.cos(angle) >= 0) {
    dx = width * 0.5;
  } else {
    dx = -width * 0.5;
  }
  const x = baseX - dx;

  const baseY = tickPosition.y;
  let dy = 0;
  if (isInRange(angle, -PI_3_4, -PI_1_4)) {
    dy = -height * 0.5;
  } else if (isInRange(angle, PI_1_4, PI_3_4)) {
    dy = height * 0.5;
  } else if (Math.cos(angle) >= 0) {
    dy = (0.5 - (PI_1_4 - angle) / PI_1_2) * height;
  } else {
    dy = (0.5 - clampRadian(angle - PI_3_4) / PI_1_2) * height;
  }
  const y = baseY - dy;

  return { x, y };
}

export function getAxisBreakSymbolAttrs(props: BreakSymbol = {}) {
  const { shape, style = {} } = props;
  const symbolStyle = merge({}, DEFAULT_AXIS_BREAK_SYMBOL_STYLE, style);
  const symbolSize = symbolStyle.size ?? DEFAULT_AXIS_BREAK_SYMBOL_STYLE.size;
  return {
    symbolType:
      shape ??
      symbolStyle.symbolType ??
      `M ${-symbolSize / 2} ${symbolSize / 2} L ${symbolSize / 2} ${-symbolSize / 2}`,
    ...symbolStyle
  };
}
export function getElMap(g: IGroup) {
  const elMap: Dict<IGraphic> = {};
  traverseGroup(g, (el: IGraphic) => {
    if ((el as IGraphic).type !== 'group' && el.id) {
      elMap[el.id] = el;
    }
  });
  return elMap;
}

export function getVerticalCoord(point: Point, vector: Vector2): Point {
  return {
    x: point.x + vector[0],
    y: point.y + vector[1]
  };
}

export function getCircleVerticalVector(
  offset: number,
  point: Point,
  center: Point,
  inside = false,
  axisInside = false
): Vector2 {
  const vector: [number, number] = [point.x - center.x, point.y - center.y];
  return scale(vector, ((inside ? -1 : 1) * (axisInside ? -1 : 1) * offset) / length(vector));
}

/**
 * 计算对应角度下的角度轴标签定位属性
 * @param angle 弧度角，需要注意是逆时针计算的
 * @returns
 */
export function angleLabelOrientAttribute(angle: number) {
  let align: TextAlignType = 'center';
  let baseline: TextBaselineType = 'middle';

  angle = normalizeAngle(angle);

  // left: 5/3 - 1/3; right: 2/3 - 4/3; center: 5/3 - 1/3 & 2/3 - 4/3
  if (angle >= Math.PI * (5 / 3) || angle <= Math.PI * (1 / 3)) {
    align = 'left';
  } else if (angle >= Math.PI * (2 / 3) && angle <= Math.PI * (4 / 3)) {
    align = 'right';
  } else {
    align = 'center';
  }

  // bottom: 7/6 - 11/6; top: 1/6 - 5/6; middle: 11/6 - 1/6 & 5/6 - 7/6
  if (angle >= Math.PI * (7 / 6) && angle <= Math.PI * (11 / 6)) {
    baseline = 'bottom';
  } else if (angle >= Math.PI * (1 / 6) && angle <= Math.PI * (5 / 6)) {
    baseline = 'top';
  } else {
    baseline = 'middle';
  }

  return { align, baseline };
}

export function getPolarAngleLabelPosition(
  angle: number,
  center: { x: number; y: number },
  radius: number,
  labelOffset: number,
  inside: boolean,
  text: string | number,
  style: Partial<ITextGraphicAttribute>
) {
  const point = polarToCartesian({ x: 0, y: 0 }, radius, angle);
  const labelPoint = getVerticalCoord(point, getCircleVerticalVector(labelOffset, point, center, inside));
  const vector = getCircleVerticalVector(labelOffset || 1, labelPoint, center, inside);
  return getCircleLabelPosition(labelPoint, vector, text, style);
}

export function getCirclePoints(center: Point, count: number, radius: number, startAngle: number, endAngle: number) {
  const points: Point[] = [];
  const range = endAngle - startAngle;
  for (let i = 0; i < count; i++) {
    const angle = startAngle + (i * range) / count;
    points.push(polarToCartesian(center, radius, angle));
  }
  return points;
}

export function getPolygonPath(points: Point[], closed: boolean) {
  let path = '';
  if (points.length === 0) {
    return path;
  }
  points.forEach((point, index) => {
    if (index === 0) {
      path = `M${point.x},${point.y}`;
    } else {
      path += `L${point.x},${point.y}`;
    }
  });
  if (closed) {
    path += 'Z';
  }

  return path;
}
