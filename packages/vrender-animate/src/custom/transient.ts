import type { IGraphic } from '@visactor/vrender-core';
import { AttributeUpdateType } from '@visactor/vrender-core/event/constant';

const animateUpdateContext = { type: AttributeUpdateType.ANIMATE_UPDATE };
const animateBindContext = { type: AttributeUpdateType.ANIMATE_BIND };
const animateStartContext = { type: AttributeUpdateType.ANIMATE_START };

function getAnimationContext(type: AttributeUpdateType) {
  switch (type) {
    case AttributeUpdateType.ANIMATE_UPDATE:
      return animateUpdateContext;
    case AttributeUpdateType.ANIMATE_BIND:
      return animateBindContext;
    case AttributeUpdateType.ANIMATE_START:
      return animateStartContext;
    default:
      return { type };
  }
}

function prepareAnimationFrameAttribute(target: IGraphic): Record<string, any> {
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
  transientTarget.attributeMayContainTransientAttrs = true;
  return transientTarget.attribute;
}

function commitAnimationFrameAttribute(target: IGraphic): void {
  (target as any).onAttributeUpdate?.(animateUpdateContext);
}

export function applyAnimationFrameAttributes(target: IGraphic, attributes?: Record<string, any> | null): void {
  if (!attributes) {
    return;
  }

  const targetAttribute = prepareAnimationFrameAttribute(target);
  for (const key in attributes) {
    if (Object.prototype.hasOwnProperty.call(attributes, key)) {
      targetAttribute[key] = attributes[key];
    }
  }
  commitAnimationFrameAttribute(target);
}

export function applyAnimationFrameNumberAttributes(
  target: IGraphic,
  keys: string[],
  from: Record<string, any>,
  to: Record<string, any>,
  ratio: number
): void {
  const targetAttribute = prepareAnimationFrameAttribute(target);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    targetAttribute[key] = from[key] + (to[key] - from[key]) * ratio;
  }
  commitAnimationFrameAttribute(target);
}

export function applyAnimationTransientAttributes(
  target: IGraphic,
  attributes?: Record<string, any> | null,
  type: AttributeUpdateType = AttributeUpdateType.ANIMATE_UPDATE
): void {
  if (!attributes) {
    return;
  }

  const context = getAnimationContext(type);
  const transientTarget = target as any;
  if (typeof transientTarget.applyAnimationTransientAttributes === 'function') {
    transientTarget.applyAnimationTransientAttributes(attributes, false, context);
    return;
  }

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
