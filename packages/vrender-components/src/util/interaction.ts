import type { FederatedPointerEvent, IGraphic, IGroup } from '@visactor/vrender-core';
import { StateValue } from '../constant';
import { traverseGroup } from '../util';
import { isEmpty } from '@visactor/vutils';

export const dispatchHoverState = (e: FederatedPointerEvent, container: IGroup, lastHover: IGraphic | null) => {
  const target = e.target as unknown as IGraphic;
  if (target !== lastHover && target.name && !isEmpty(target.states)) {
    target.addState(StateValue.hover, true);
    traverseGroup(container, (node: IGraphic) => {
      if (node !== target && node.name && !isEmpty(node.states)) {
        node.addState(StateValue.hoverReverse, true);
      }
    });
    return target;
  }
  return lastHover;
};

export const dispatchUnHoverState = (e: FederatedPointerEvent, container: IGroup, lastHover: IGraphic | null) => {
  if (lastHover) {
    traverseGroup(container, (node: IGraphic) => {
      if (node.name && !isEmpty(node.states)) {
        node.removeState(StateValue.hoverReverse);
        node.removeState(StateValue.hover);
      }
    });
    return null;
  }
  return lastHover;
};

export const dispatchClickState = (e: FederatedPointerEvent, container: IGroup, lastSelect: IGraphic | null) => {
  const target = e.target as unknown as IGraphic;
  if (lastSelect === target && target.hasState(StateValue.selected)) {
    traverseGroup(container, (node: IGraphic) => {
      if (node.name && !isEmpty(node.states)) {
        node.removeState(StateValue.selectedReverse);
        node.removeState(StateValue.selected);
      }
    });
    // 取消选中
    return null;
  }

  if (target.name && !isEmpty(target.states)) {
    target.addState(StateValue.selected, true);
    traverseGroup(container, (node: IGraphic) => {
      if (node !== target && node.name && !isEmpty(node.states)) {
        node.addState(StateValue.selectedReverse, true);
      }
    });
    return target;
  }
  return lastSelect;
};
