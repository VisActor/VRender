/**
 * @description drag and drop event
 */
import type { IEventTarget, IEventExtension, FederatedPointerEvent } from '@visactor/vrender-core';

export class DragNDrop implements IEventExtension {
  rootNode!: IEventTarget | null;

  constructor(rootNode: IEventTarget) {
    this.rootNode = rootNode;
    this.initEvents();
  }

  initEvents() {
    this.rootNode?.addEventListener('pointerdown', this.onPointerDown);
  }

  removeEvents() {
    this.rootNode?.removeEventListener('pointerdown', this.onPointerDown);
  }

  release() {
    this.removeEvents();
    this.rootNode = null;
  }

  private onPointerDown = (event: FederatedPointerEvent) => {
    const target = event.target;
    const rootNode = this.rootNode;
    const isRoot = target === rootNode;

    if (target && !isRoot) {
      let dragstartTriggered = false;

      let currentDroppable: IEventTarget;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line no-inner-declarations
      function handlePointerMove(moveEvent: FederatedPointerEvent) {
        if (!dragstartTriggered) {
          moveEvent.type = 'dragstart';

          target?.dispatchEvent(moveEvent);
          dragstartTriggered = true;
        }

        moveEvent.type = 'drag';
        target?.dispatchEvent(moveEvent);

        if (!isRoot) {
          // 获取当前坐标系的元素，目前认为所有的元素都是可以 dropable 的
          (target as IEventTarget).pickable = false;
          // @ts-ignore
          const clickResult = rootNode?.pick(moveEvent.global.x, moveEvent.global.y);
          const elemBelow = clickResult.graphic;
          (target as IEventTarget).pickable = true;

          if (currentDroppable !== elemBelow) {
            if (currentDroppable) {
              moveEvent.type = 'dragleave';
              moveEvent.target = currentDroppable;
              currentDroppable.dispatchEvent(moveEvent);
            }

            if (elemBelow) {
              moveEvent.type = 'dragenter';
              moveEvent.target = elemBelow;
              elemBelow.dispatchEvent(moveEvent);
            }

            currentDroppable = elemBelow;
            if (currentDroppable) {
              moveEvent.type = 'dragover';
              moveEvent.target = currentDroppable;
              currentDroppable.dispatchEvent(moveEvent);
            }
          }
        }
      }

      rootNode?.addEventListener('pointermove', handlePointerMove);

      const stopDragging = function () {
        if (dragstartTriggered) {
          if (currentDroppable) {
            event.type = 'drop';
            event.target = currentDroppable;
            currentDroppable.dispatchEvent(event);
          }

          event.type = 'dragend';
          target.dispatchEvent(event);

          dragstartTriggered = false;
        }

        rootNode?.removeEventListener('pointermove', handlePointerMove);
      };

      target.addEventListener('pointerup', stopDragging, { once: true });
      target.addEventListener('pointerupoutside', stopDragging, { once: true });
    }
  };
}
