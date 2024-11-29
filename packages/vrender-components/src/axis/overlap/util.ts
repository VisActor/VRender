import type { IText } from '@visactor/vrender-core';
import { isNil, rotatePoint } from '@visactor/vutils';

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

const DELTA_ANGLE = Math.sin(Math.PI / 10);
export function isAngleVertical(angle: number) {
  const hasAngle = !isNil(angle) && angle !== 0;
  const cos = hasAngle ? Math.cos(angle) : 1;
  return hasAngle && Math.abs(cos) <= DELTA_ANGLE;
}

export function isAngleHorizontal(angle: number) {
  const hasAngle = !isNil(angle) && angle !== 0;
  const sin = hasAngle ? Math.sin(angle) : 0;
  return !hasAngle || Math.abs(sin) <= DELTA_ANGLE;
}
