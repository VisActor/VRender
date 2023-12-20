import type { IText } from '@visactor/vrender-core';
import { isRectIntersect, isRotateAABBIntersect } from '@visactor/vutils';

function rotate(x: number, y: number, deg: number, originX: number, originY: number) {
  return {
    x: (x - originX) * Math.cos(deg) + (y - originY) * Math.sin(deg) + originX,
    y: (x - originX) * Math.sin(deg) + (originY - y) * Math.cos(deg) + originY
  };
}

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
    // 旋转
    const rotatedCenter = rotate(bounds.centerX, bounds.centerY, bounds.angle, item.attribute.x, item.attribute.y);
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
  return (
    isRectIntersect(item1.AABBBounds, item2.AABBBounds, false) &&
    (item1.rotatedBounds && item2.rotatedBounds
      ? isRotateAABBIntersect(item1.rotatedBounds, item2.rotatedBounds, true)
      : true)
  );
}
