import { AttributeUpdateType } from '@visactor/vrender-core';
import { AnimateExtension } from '../../src/animate-extension';

describe('AnimateExtension close-out', () => {
  const createTarget = (overrides: Record<string, unknown> = {}) =>
    Object.assign(Object.create(AnimateExtension.prototype), overrides);

  test('should sync finalAttribute through the standard transient path', () => {
    const target: any = createTarget({
      finalAttribute: { fill: 'red' },
      setAttributesAndPreventAnimate: jest.fn(),
      setAttributes: jest.fn()
    });

    target.applyFinalAttributeToAttribute();

    expect(target.setAttributesAndPreventAnimate).toHaveBeenCalledWith({ fill: 'red' }, false, {
      type: AttributeUpdateType.ANIMATE_BIND
    });
    expect(target.setAttributes).not.toHaveBeenCalled();
  });

  test('should restore through the standard static truth path', () => {
    const restore = jest.fn();
    const target: any = createTarget({
      _restoreAttributeFromStaticTruth: restore
    });

    target.restoreStaticAttribute();

    expect(restore).toHaveBeenCalledWith({ type: AttributeUpdateType.ANIMATE_END });
  });
});
