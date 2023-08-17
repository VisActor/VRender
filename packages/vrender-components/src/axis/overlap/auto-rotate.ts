/**
 * @description 坐标轴标签自动旋转
 */
import type { IText, TextAlignType, TextBaselineType } from '@visactor/vrender';
import { degreeToRadian, isEmpty, isRotateAABBIntersect } from '@visactor/vutils';

type RotateConfig = {
  /**
   * 坐标轴的显示位置
   */
  orient: string;
  /**
   * 自动旋转的可选角度
   */
  labelRotateAngle?: number[];
};

export function autoRotate(items: IText[], rotateConfig: RotateConfig) {
  if (isEmpty(items)) {
    return;
  }

  const { orient, labelRotateAngle = [0, 45, 90] } = rotateConfig;
  if (labelRotateAngle.length === 0 || items.some(item => !!item.attribute.angle)) {
    return;
  }

  let i = 0;
  let n = 0;
  if (labelRotateAngle && labelRotateAngle.length > 0) {
    n = labelRotateAngle.length;
  }

  while (i < n) {
    const angle = labelRotateAngle[i++];
    items.forEach(item => {
      // item.angle = angle;
      item.attribute.angle = degreeToRadian(angle);
    });
    tryRotate(orient, items);
    if (!hasIntersect(items)) {
      break;
    }
  }
}

function hasIntersect(items: IText[]): boolean {
  for (let i = 1; i < items.length; i++) {
    if (itemIntersect(items[i - 1], items[i])) {
      return true;
    }
  }
  return false;
}

function itemIntersect(item1: IText, item2: IText) {
  return isRotateAABBIntersect(item1.rotatedBounds, item2.rotatedBounds, true);
}

function tryRotate(orient: string, items: IText[]) {
  // 针对 top bottom轴的自动旋转逻辑
  if (orient === 'bottom' || orient === 'top') {
    rotateXAxis(orient, items);
  }
  if (orient === 'left' || orient === 'right') {
    rotateYAxis(orient, items);
  }
  // 先旋转，再计算这个limit，避免算limit后发现不需要旋转，导致莫名的水平limit
  genRotateBounds(items);
}

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

function genRotateBounds(items: IText[]) {
  items.forEach(item => {
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

function clampAngle(angle = 0) {
  if (angle < 0) {
    while (angle < 0) {
      angle += Math.PI * 2;
    }
  }
  if (angle > 0) {
    while (angle >= Math.PI * 2) {
      angle -= Math.PI * 2;
    }
  }

  return angle;
}

export function rotateYAxis(orient: string, items: IText[]) {
  // 由于左右轴会裁切，所以上下两个label需要额外处理，做tighten处理
  items.forEach((item, i) => {
    const angle = clampAngle(item.attribute.angle || 0);
    item.setAttributes({
      ...getYAxisLabelAlign(orient, angle),
      angle: angle
    });
  });
}

export function rotateXAxis(orient: string, items: IText[]) {
  items.forEach(item => {
    const angle = clampAngle(item.attribute.angle || 0);
    item.setAttributes({
      ...getXAxisLabelAlign(orient, angle),
      angle: angle
    });
  });
}

export function getXAxisLabelAlign(orient: string, angle: number = 0) {
  //                0,      0-90,   90,     90-180,   180,    180-270, 270,     270-360,   360
  let align = ['center', 'left', 'left', 'left', 'center', 'right', 'right', 'right', 'left'];
  let baseline = ['top', 'top', 'middle', 'bottom', 'bottom', 'bottom', 'middle', 'top', 'top'];
  if (orient === 'top') {
    //            0,      0-90,   90,     90-180,   180,    180-270, 270,     270-360,   360
    align = ['center', 'right', 'right', 'right', 'center', 'left', 'left', 'left', 'right'];
    baseline = ['bottom', 'bottom', 'middle', 'top', 'top', 'top', 'middle', 'bottom', 'bottom'];
  }

  const step = angle / (Math.PI * 0.5);
  let index;
  if (step === Math.floor(step)) {
    index = Math.floor(step) * 2;
  } else {
    index = Math.floor(step) * 2 + 1;
  }

  return {
    textAlign: align[index] as TextAlignType,
    textBaseline: baseline[index] as TextBaselineType
  };
}

export function getYAxisLabelAlign(orient: string, angle: number = 0) {
  //                0,      0-90,       90,     90-180,   180,    180-270, 270,     270-360,   360
  let align = ['right', 'right', 'center', 'left', 'center', 'left', 'center', 'right', 'right'];
  let baseline = ['middle', 'middle', 'top', 'top', 'middle', 'middle', 'bottom', 'bottom', 'middle'];

  if (orient === 'right') {
    //            0,      0-90,   90,     90-180,   180,    180-270, 270,     270-360,   360
    align = ['left', 'right', 'right', 'right', 'left', 'left', 'left', 'left', 'right'];
    baseline = ['middle', 'bottom', 'middle', 'top', 'top', 'top', 'middle', 'bottom', 'bottom'];
  }

  const step = angle / (Math.PI * 0.5);
  let index;
  if (step === Math.floor(step)) {
    index = Math.floor(step) * 2;
  } else {
    index = Math.floor(step) * 2 + 1;
  }

  return {
    textAlign: align[index] as TextAlignType,
    textBaseline: baseline[index] as TextBaselineType
  };
}
