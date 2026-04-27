import { AttributeUpdateType, type IGraphic } from '@visactor/vrender-core';

export function applyAnimationTransientAttributes(
  target: IGraphic,
  attributes?: Record<string, any> | null,
  type: AttributeUpdateType = AttributeUpdateType.ANIMATE_UPDATE
): void {
  if (!attributes) {
    return;
  }

  const context = { type };
  const transientTarget = target as any;
  if (typeof transientTarget.applyTransientAttributes === 'function') {
    transientTarget.applyTransientAttributes(attributes, false, context);
    return;
  }

  if (typeof transientTarget.setAttributesAndPreventAnimate === 'function') {
    transientTarget.setAttributesAndPreventAnimate(attributes, false, context);
    return;
  }

  if (!transientTarget.attribute) {
    transientTarget.attribute = {};
  }
  Object.assign(transientTarget.attribute, attributes);
  transientTarget.onAttributeUpdate?.(context);
}

export function applyAppearStartAttributes(target: IGraphic, attributes?: Record<string, any> | null): void {
  applyAnimationTransientAttributes(target, attributes, AttributeUpdateType.ANIMATE_BIND);
}
