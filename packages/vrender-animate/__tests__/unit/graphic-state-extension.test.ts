import { GraphicStateExtension } from '../../src/state/graphic-extension';
import { AnimationStateManager } from '../../src/state/animation-state';

describe('GraphicStateExtension', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should lazily create AnimationStateManager only when animation state APIs are used', () => {
    jest.spyOn(AnimationStateManager.prototype, 'applyState').mockImplementation(() => undefined);
    const graphic: any = Object.assign(Object.create(GraphicStateExtension.prototype), {});

    GraphicStateExtension.extend(graphic);

    expect(graphic._animationStateManager).toBeUndefined();

    graphic.applyAnimationState(
      ['state'],
      [
        {
          name: 'state',
          animation: {
            type: 'state',
            to: { fill: 'red' },
            duration: 200,
            easing: 'cubicOut'
          }
        }
      ]
    );

    expect(graphic._animationStateManager).toBeInstanceOf(AnimationStateManager);
  });

  test('should delegate applyAnimationState directly to AnimationStateManager without touching graphic state fields', () => {
    const applyState = jest.spyOn(AnimationStateManager.prototype, 'applyState').mockImplementation(() => undefined);
    const graphic: any = Object.assign(Object.create(GraphicStateExtension.prototype), {
      currentStates: ['hover'],
      normalAttrs: { fill: 'blue' }
    });
    const animationConfig = [
      {
        name: 'state',
        animation: {
          type: 'state',
          to: { fill: 'red' },
          duration: 200,
          easing: 'cubicOut'
        }
      }
    ];

    graphic.applyAnimationState(['state'], animationConfig);

    expect(applyState).toHaveBeenCalledWith(['state'], animationConfig, undefined);
    expect(graphic.currentStates).toEqual(['hover']);
    expect(graphic.normalAttrs).toEqual({ fill: 'blue' });
  });

  test('should clear only animation execution state', () => {
    const clearState = jest.spyOn(AnimationStateManager.prototype, 'clearState').mockImplementation(() => undefined);
    const graphic: any = Object.assign(Object.create(GraphicStateExtension.prototype), {
      _animationStateManager: new AnimationStateManager({} as any),
      currentStates: ['hover'],
      normalAttrs: { fill: 'blue' }
    });

    graphic.clearAnimationStates();

    expect(clearState).toHaveBeenCalledTimes(1);
    expect(graphic.currentStates).toEqual(['hover']);
    expect(graphic.normalAttrs).toEqual({ fill: 'blue' });
  });
});
