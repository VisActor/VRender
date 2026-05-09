import { AttributeUpdateType, type IGraphic } from '@visactor/vrender-core';

const animateUpdateContext = { type: AttributeUpdateType.ANIMATE_UPDATE };

export function applyAnimationFrameAttributes(target: IGraphic, attributes?: Record<string, any> | null): void {
  if (!attributes) {
    return;
  }

  const transientTarget = target as any;
  if (!transientTarget.attribute) {
    transientTarget.attribute = {};
  }
  if (
    transientTarget.attribute === transientTarget.baseAttributes &&
    typeof transientTarget.detachAttributeFromBaseAttributes === 'function'
  ) {
    transientTarget.detachAttributeFromBaseAttributes();
  }
  const targetAttribute = transientTarget.attribute;
  for (const key in attributes) {
    if (Object.prototype.hasOwnProperty.call(attributes, key)) {
      targetAttribute[key] = attributes[key];
    }
  }
  transientTarget.onAttributeUpdate?.(animateUpdateContext);
}

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
