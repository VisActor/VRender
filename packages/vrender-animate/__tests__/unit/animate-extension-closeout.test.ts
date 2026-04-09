import { AttributeUpdateType } from '@visactor/vrender-core';
import { AnimateExtension } from '../../src/animate-extension';

describe('AnimateExtension close-out', () => {
  const createTarget = (overrides: Record<string, unknown> = {}) =>
    Object.assign(Object.create(AnimateExtension.prototype), overrides);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should sync finalAttribute through transient path instead of setAttributes fallback', () => {
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

  test('should warn and refuse finalAttribute -> setAttributes fallback when no transient path exists', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const target: any = createTarget({
      finalAttribute: { fill: 'red' },
      setAttributes: jest.fn()
    });

    target.applyFinalAttributeToAttribute();

    expect(target.setAttributes).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('applyFinalAttributeToAttribute requires target.setAttributesAndPreventAnimate()')
    );
  });

  test('should prefer _restoreAttributeFromStaticTruth and only warn when falling back to onStop', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const restore = jest.fn();
    const onStop = jest.fn();
    const target: any = createTarget({
      _restoreAttributeFromStaticTruth: restore,
      onStop
    });

    target.restoreStaticAttribute();

    expect(restore).toHaveBeenCalledWith({ type: AttributeUpdateType.ANIMATE_END });
    expect(onStop).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  test('should warn when only deprecated onStop fallback is available', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const onStop = jest.fn();
    const target: any = createTarget({
      onStop
    });

    target.restoreStaticAttribute();

    expect(onStop).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('deprecated target.onStop()'));
  });
});
