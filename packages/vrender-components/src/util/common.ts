/**
 * @description 存放工具函数
 */
import { IGraphicAttribute, IGraphic, IGroup } from '@visactor/vrender';
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
