/**
 * @description 坐标轴标签自动旋转
 */
import type { IText, TextAlignType, TextBaselineType } from '@visactor/vrender-core';
import { degreeToRadian, isEmpty } from '@visactor/vutils';
import { genRotateBounds, itemIntersect } from './util';

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
    item.attribute.angle &&
      item.setAttributes({
        ...getYAxisLabelAlign(orient, item.attribute.angle),
        angle: clampAngle(item.attribute.angle)
      });
  });
}

export function rotateXAxis(orient: string, items: IText[]) {
  items.forEach(item => {
    item.attribute.angle &&
      item.setAttributes({
        ...getXAxisLabelAlign(orient, item.attribute.angle),
        angle: clampAngle(item.attribute.angle)
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

  angle = clampAngle(angle);
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
  //           0,      0-90,       90,     90-180,   180,    180-270, 270,     270-360,   360
  let align = ['right', 'right', 'center', 'left', 'left', 'left', 'center', 'right', 'right'];
  let baseline = ['middle', 'middle', 'top', 'top', 'middle', 'middle', 'bottom', 'bottom', 'middle'];

  if (orient === 'right') {
    //        0,      0-90,   90,     90-180,   180,   180-270, 270,  270-360,   360
    align = ['left', 'left', 'center', 'right', 'right', 'right', 'center', 'left', 'left'];
    baseline = ['middle', 'middle', 'bottom', 'bottom', 'middle', 'middle', 'top', 'middle', 'middle'];
  }

  angle = clampAngle(angle);
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
