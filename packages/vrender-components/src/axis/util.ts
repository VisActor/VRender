// eslint-disable-next-line no-duplicate-imports
import type { IGraphic, IGroup, IText, TextAlignType, TextBaselineType } from '@visactor/vrender-core';
import type { Dict, IBounds } from '@visactor/vutils';
// eslint-disable-next-line no-duplicate-imports
import { isGreater, isLess, tau, normalizeAngle, polarToCartesian, merge } from '@visactor/vutils';
import { traverseGroup } from '../util/common';
import type { Vector2 } from '../util';
// eslint-disable-next-line no-duplicate-imports
import { scale, length } from '../util';
import type { BreakSymbol } from './type';
import { DEFAULT_AXIS_BREAK_SYMBOL_STYLE } from './config';
import type { Point } from '../core/type';
import { isAngleHorizontal } from './overlap/util';

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

export function getCircleLabelPosition(tickPosition: Point, tickVector: [number, number]) {
  return {
    x: tickPosition.x + tickVector[0],
    y: tickPosition.y + tickVector[1]
  };
}

export function getAxisBreakSymbolAttrs(props: BreakSymbol = {}) {
  const { style = {}, angle = Math.PI * 0.5 } = props;
  const symbolStyle = merge({}, DEFAULT_AXIS_BREAK_SYMBOL_STYLE, style);
  const symbolSize = symbolStyle.size ?? DEFAULT_AXIS_BREAK_SYMBOL_STYLE.size;
  return {
    ...symbolStyle,
    symbolType:
      symbolStyle.symbolType ??
      `M ${-symbolSize / 2} ${symbolSize * Math.sin(angle)} L ${symbolSize / 2} ${-symbolSize * Math.sin(angle)}`,
    symbolSize
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
  inside: boolean
) {
  const point = polarToCartesian({ x: 0, y: 0 }, radius, angle);
  const labelPoint = getVerticalCoord(point, getCircleVerticalVector(labelOffset, point, center, inside));
  const vector = getCircleVerticalVector(labelOffset || 1, labelPoint, center, inside);
  return getCircleLabelPosition(labelPoint, vector);
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

export function textIntersect(textA: IText, textB: IText, sep: number) {
  let a: IBounds;
  let b: IBounds;
  // 注意：默认旋转角度一样
  const angle = textA.attribute?.angle;
  const isHorizontal = isAngleHorizontal(angle, Number.EPSILON);
  const isAABBIntersects = (textA: IText, textB: IText, sep: number) => {
    a = textA.AABBBounds;
    b = textB.AABBBounds;
    return sep > Math.max(b.x1 - a.x2, a.x1 - b.x2, b.y1 - a.y2, a.y1 - b.y2);
  };

  // 水平文字可以直接用 AABB 包围盒计算
  if (isHorizontal) {
    return isAABBIntersects(textA, textB, sep);
  }

  a = textA.OBBBounds;
  b = textB.OBBBounds;

  // 没有 OBB bounds 则用 AABB 包围盒计算
  if (!a || !b || a.empty() || b.empty()) {
    return isAABBIntersects(textA, textB, sep);
  }

  // 非水平文字且有 OBB 包围盒
  // TODO: 待支持有旋转角度下的 sep 计算逻辑
  return a.intersects(b);
  //   const expandedTextA = textA.clone();
  //   const boundsPaddingA = textA.attribute.boundsPadding ?? 0;
  //   expandedTextA.setAttributes({
  //     boundsPadding: isNumber(boundsPaddingA) ? boundsPaddingA + sep / 2 : boundsPaddingA.map(v => v + sep / 2)
  //   });
  //   const expandTextB = textB.clone();
  //   const boundsPaddingB = textB.attribute.boundsPadding ?? 0;

  //   expandTextB.setAttributes({
  //     boundsPadding: isNumber(boundsPaddingB) ? boundsPaddingB + sep / 2 : boundsPaddingB.map(v => v + sep / 2)
  //   });

  //   return expandedTextA.OBBBounds.intersects(expandTextB.OBBBounds);
}

export function hasOverlap<T>(items: IText[], pad: number): boolean {
  for (let i = 1, n = items.length, a = items[0], b; i < n; a = b, ++i) {
    b = items[i];
    if (textIntersect(a, b, pad)) {
      return true;
    }
  }
  return false;
}
