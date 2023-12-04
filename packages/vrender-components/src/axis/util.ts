import { getTextBounds } from '@visactor/vrender/es/core';
// eslint-disable-next-line no-duplicate-imports
import type { ITextGraphicAttribute } from '@visactor/vrender/es/core';
import { isGreater, isLess, tau, type Point } from '@visactor/vutils';

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

export function getLabelPosition(
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
