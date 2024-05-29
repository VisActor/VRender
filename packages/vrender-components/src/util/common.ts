/**
 * @description 存放工具函数
 */
import type { IGraphicAttribute, IGraphic, IGroup } from '@visactor/vrender-core';
import { isNil } from '@visactor/vutils';
import type { Point } from '../core/type';
import type { IMarkLineLabelPosition, IMarkPointItemPosition } from '../marker';

export function traverseGroup(group: IGraphic, cb: (node: IGraphic) => boolean | void) {
  group.forEachChildren(node => {
    const stopped = cb(node as IGraphic);
    if ((node as IGroup).isContainer && !stopped) {
      traverseGroup(node as IGraphic, cb);
    }
  });
}

export const isVisible = (obj?: Partial<IGraphicAttribute>): boolean => {
  if (isNil(obj)) {
    return false;
  }
  return obj.visible !== false;
};

export function getMarksByName(root: IGroup, name: string) {
  if (!name) {
    return [];
  }
  const group = root.find(node => node.name === name, true) as IGroup;
  if (!group) {
    return [];
  }
  return group.getChildren() as IGraphic[];
}

export function getNoneGroupMarksByName(root: IGroup, name: string) {
  if (!name) {
    return [];
  }
  const group = root.find(node => node.name === name, true) as IGroup;
  if (!group) {
    return [];
  }
  return group.findAll(node => node.type !== 'group', true) as unknown as IGraphic[];
}

export function removeRepeatPoint(points: Point[]) {
  const result = [points[0]];
  for (let i = 1; i < points.length; i++) {
    if (points[i].x !== points[i - 1].x || points[i].y !== points[i - 1].y) {
      result.push(points[i]);
    }
  }
  return result;
}

export function isPostiveXAxis(angle: number) {
  return (angle >= 0 && angle < Math.PI / 2) || (angle > (Math.PI * 3) / 2 && angle <= Math.PI * 2);
}

export function fuzzyEqualNumber(a: number, b: number, delta: number): boolean {
  return Math.abs(a - b) < delta;
}

export function getTextAlignAttrOfVerticalDir(
  autoRotate: boolean,
  lineEndAngle: number,
  itemPosition: IMarkLineLabelPosition | keyof typeof IMarkPointItemPosition
) {
  if (autoRotate) {
    return {
      textAlign: 'right',
      textBaseline: 'middle'
    };
  }
  return {
    textAlign:
      // left: 90度方向, 即笛卡尔坐标系y轴负方向 + top 或 270度方向, 即笛卡尔坐标系y轴正方向 + bottom
      (lineEndAngle < Math.PI && itemPosition.toLocaleLowerCase().includes('top')) ||
      (lineEndAngle > Math.PI && itemPosition.toLocaleLowerCase().includes('bottom'))
        ? 'left'
        : // right: 90度方向, 即笛卡尔坐标系y轴负方向 + bottom 或 270度方向, 即笛卡尔坐标系y轴正方向 + top
        (lineEndAngle < Math.PI && itemPosition.toLocaleLowerCase().includes('bottom')) ||
          (lineEndAngle > Math.PI && itemPosition.toLocaleLowerCase().includes('top'))
        ? 'right'
        : 'center',
    textBaseline:
      // bottom: 90度方向, 即笛卡尔坐标系y轴负方向 + inside 或 270度方向, 即笛卡尔坐标系y轴正方向 + outside
      (lineEndAngle < Math.PI && itemPosition.includes('inside')) ||
      (lineEndAngle > Math.PI && !itemPosition.includes('inside'))
        ? 'bottom'
        : 'top'
  };
}
