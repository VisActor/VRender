import type { IGraphic } from '@visactor/vrender-core';
import type { IBoundsLike } from '@visactor/vutils';

export function computeOffsetForlimit(shape: IGraphic, bounds: IBoundsLike) {
  const { x1: regionMinX, y1: regionMinY, x2: regionMaxX, y2: regionMaxY } = bounds;
  const { x1, y1, x2, y2 } = shape.AABBBounds;

  let dx = 0;
  let dy = 0;
  if (x1 < regionMinX) {
    // 超出左侧
    dx = regionMinX - x1;
  }
  if (y1 < regionMinY) {
    // 超出顶部
    dy = regionMinY - y1;
  }

  if (x2 > regionMaxX) {
    // 超出右侧
    dx = regionMaxX - x2;
  }

  if (y2 > regionMaxY) {
    // 整体超出顶部
    dy = regionMaxY - y2;
  }
  return {
    dx,
    dy
  };
}
export function limitShapeInBounds(shape: IGraphic, bounds: IBoundsLike) {
  const { dx, dy } = computeOffsetForlimit(shape, bounds);
  const { dx: originDx = 0, dy: originDy = 0 } = shape.attribute;
  if (dx) {
    shape.setAttribute('dx', dx + originDx);
  }
  if (dy) {
    shape.setAttribute('dy', dy + originDy);
  }
}
