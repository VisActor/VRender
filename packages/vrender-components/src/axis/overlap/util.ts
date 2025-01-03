import type { IText } from '@visactor/vrender-core';
import { isNil, isRectIntersect, isRotateAABBIntersect, rotatePoint } from '@visactor/vutils';

// 计算水平情况下的包围盒
function genNormalBounds(item: IText) {
  const bounds = item.AABBBounds;

  return {
    x1: bounds.x1,
    x2: bounds.x2,
    y1: bounds.y1,
    y2: bounds.y2,
    centerX: item.attribute.x,
    centerY: item.attribute.y,
    angle: item.attribute.angle
  };
}

export function genRotateBounds(items: IText[]) {
  items.forEach(item => {
    if (item.rotatedBounds || !item.attribute.angle) {
      return;
    }
    // 计算水平情况下的包围盒
    const bounds = genNormalBounds(item);
    const rotatedCenter = rotatePoint({ x: item.attribute.x, y: item.attribute.y }, bounds.angle, {
      x: bounds.centerX,
      y: bounds.centerY
    });

    const deltaX = rotatedCenter.x - bounds.centerX;
    const deltaY = rotatedCenter.y - bounds.centerY;
    bounds.x1 += deltaX;
    bounds.x2 += deltaX;
    bounds.y1 += deltaY;
    bounds.y2 += deltaY;
    bounds.centerX += deltaX;
    bounds.centerY += deltaY;
    item.rotatedBounds = bounds;
  });
}

export function itemIntersect(item1: IText, item2: IText) {
  if (!item1.OBBBounds?.empty() && !item2.OBBBounds?.empty()) {
    return item1.OBBBounds.intersects(item2.OBBBounds);
  }
  return (
    isRectIntersect(item1.AABBBounds, item2.AABBBounds, false) &&
    (item1.rotatedBounds && item2.rotatedBounds
      ? isRotateAABBIntersect(item1.rotatedBounds, item2.rotatedBounds, true)
      : true)
  );
}

const DELTA_ANGLE = Math.sin(Math.PI / 10);
export function isAngleVertical(angle: number, delta = DELTA_ANGLE) {
  const hasAngle = !isNil(angle) && angle !== 0;
  const cos = hasAngle ? Math.cos(angle) : 1;
  return hasAngle && Math.abs(cos) <= delta;
}

export function isAngleHorizontal(angle: number, delta = DELTA_ANGLE) {
  const hasAngle = !isNil(angle) && angle !== 0;
  const sin = hasAngle ? Math.sin(angle) : 0;
  return !hasAngle || Math.abs(sin) <= delta;
}
