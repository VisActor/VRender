/**
 * @description 存放工具函数
 */
import type { IGraphicAttribute, IGraphic, IGroup } from '@visactor/vrender/es/core';
import { isNil } from '@visactor/vutils';

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
