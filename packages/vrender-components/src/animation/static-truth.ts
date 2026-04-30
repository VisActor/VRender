import { AttributeUpdateType, type IGraphic } from '@visactor/vrender-core';
import { cloneDeep } from '@visactor/vutils';

export function commitUpdateAnimationTarget(
  graphic?: IGraphic,
  targetAttrs?: Record<string, any>,
  startAttrs?: Record<string, any>
) {
  if (!graphic || !targetAttrs) {
    return;
  }

  const committedTargetAttrs = cloneDeep(targetAttrs);
  const transientStartAttrs = cloneDeep(startAttrs ?? graphic.attribute);

  graphic.setAttributes(committedTargetAttrs as any);
  const baseAttributes = (graphic as any).baseAttributes;
  if (baseAttributes && typeof baseAttributes === 'object') {
    Object.keys(committedTargetAttrs).forEach(key => {
      baseAttributes[key] = cloneDeep(committedTargetAttrs[key]);
    });
  }
  (graphic as any).setFinalAttributes?.(committedTargetAttrs);
  (graphic as any).setAttributesAndPreventAnimate?.(transientStartAttrs as any, false, {
    type: AttributeUpdateType.ANIMATE_BIND
  });
}
