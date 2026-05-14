import { createGroup } from '../../../src/graphic/group';
import { createRect } from '../../../src/graphic/rect';
import { createSharedStateTestStage } from './shared-state-test-utils';

describe('Graphic same-state refresh', () => {
  const createSharedRect = (fillOpacity: number = 0.2) => {
    const stage = createSharedStateTestStage();
    const group = createGroup({});
    const rect = createRect({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      fillOpacity: 1
    });

    group.sharedStateDefinitions = {
      custom1: { fillOpacity }
    } as any;

    stage.appendChild(group);
    group.appendChild(rect);
    rect.setStates(['custom1'], false);

    return { stage, group, rect };
  };

  test('should not animate or flash back to normal attrs when states and resolved patch are unchanged', () => {
    const { rect } = createSharedRect(0.2);
    const applyAnimationState = jest.fn();
    (rect as any).applyAnimationState = applyAnimationState;
    const setAttributesAndPreventAnimate = jest.spyOn(rect as any, 'setAttributesAndPreventAnimate');

    rect.setStates(['custom1'], {
      animate: true,
      animateSameStatePatchChange: true
    });

    expect(applyAnimationState).not.toHaveBeenCalled();
    expect(setAttributesAndPreventAnimate).not.toHaveBeenCalled();
    expect(rect.currentStates).toEqual(['custom1']);
    expect(rect.resolvedStatePatch).toEqual({ fillOpacity: 0.2 });
    expect(rect.attribute.fillOpacity).toBe(0.2);
    expect(rect.baseAttributes?.fillOpacity).toBe(1);
  });

  test('should animate from the previous resolved patch when same states resolve to a new patch', () => {
    const { group, rect } = createSharedRect(0.2);
    const animationStartValues: unknown[] = [];
    const applyAnimationState = jest.fn(() => {
      animationStartValues.push(rect.attribute.fillOpacity);
    });
    (rect as any).applyAnimationState = applyAnimationState;

    group.sharedStateDefinitions = {
      custom1: { fillOpacity: 0.5 }
    } as any;
    rect.setStates(['custom1'], {
      animate: true,
      animateSameStatePatchChange: true
    });

    expect(animationStartValues).toEqual([0.2]);
    expect(applyAnimationState).toHaveBeenCalledWith(
      ['state'],
      [
        expect.objectContaining({
          animation: expect.objectContaining({
            type: 'state',
            to: { fillOpacity: 0.5 }
          })
        })
      ]
    );
    expect(rect.currentStates).toEqual(['custom1']);
    expect(rect.resolvedStatePatch).toEqual({ fillOpacity: 0.5 });
    expect(rect.attribute.fillOpacity).toBe(0.2);
    expect(rect.baseAttributes?.fillOpacity).toBe(1);
  });

  test('should synchronously apply new patch when same-state patch animation is disabled', () => {
    const { group, rect } = createSharedRect(0.2);
    const applyAnimationState = jest.fn();
    (rect as any).applyAnimationState = applyAnimationState;

    group.sharedStateDefinitions = {
      custom1: { fillOpacity: 0.5 }
    } as any;
    rect.setStates(['custom1'], {
      animate: true,
      animateSameStatePatchChange: false
    });

    expect(applyAnimationState).not.toHaveBeenCalled();
    expect(rect.currentStates).toEqual(['custom1']);
    expect(rect.resolvedStatePatch).toEqual({ fillOpacity: 0.5 });
    expect(rect.attribute.fillOpacity).toBe(0.5);
    expect(rect.baseAttributes?.fillOpacity).toBe(1);
  });

  test('should preserve existing state-change animation semantics when target state names change', () => {
    const stage = createSharedStateTestStage();
    const group = createGroup({});
    const rect = createRect({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      fillOpacity: 1
    });
    const animationStartValues: unknown[] = [];
    const applyAnimationState = jest.fn(() => {
      animationStartValues.push(rect.attribute.fillOpacity);
    });

    group.sharedStateDefinitions = {
      custom1: { fillOpacity: 0.2 },
      custom2: { fillOpacity: 0.5 }
    } as any;

    stage.appendChild(group);
    group.appendChild(rect);
    rect.setStates(['custom1'], false);
    (rect as any).applyAnimationState = applyAnimationState;

    rect.setStates(['custom2'], {
      animate: true,
      animateSameStatePatchChange: true
    });

    expect(animationStartValues).toEqual([0.2]);
    expect(applyAnimationState).toHaveBeenCalledWith(
      ['state'],
      [
        expect.objectContaining({
          animation: expect.objectContaining({
            type: 'state',
            to: { fillOpacity: 0.5 }
          })
        })
      ]
    );
    expect(rect.currentStates).toEqual(['custom2']);
    expect(rect.resolvedStatePatch).toEqual({ fillOpacity: 0.5 });
  });

  test('should refresh same states after dynamic resolver inputs change', () => {
    const stage = createSharedStateTestStage();
    const group = createGroup({});
    const rect = createRect({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      fillOpacity: 1
    });
    let nextFillOpacity = 0.2;
    const resolver = jest.fn(() => ({ fillOpacity: nextFillOpacity }));

    group.sharedStateDefinitions = {
      custom1: {
        resolver,
        declaredAffectedKeys: ['fillOpacity']
      }
    } as any;

    stage.appendChild(group);
    group.appendChild(rect);
    rect.setStates(['custom1'], false);

    nextFillOpacity = 0.5;
    rect.setStates(['custom1'], {
      animate: false
    });

    expect(resolver).toHaveBeenCalledTimes(2);
    expect(rect.currentStates).toEqual(['custom1']);
    expect(rect.resolvedStatePatch).toEqual({ fillOpacity: 0.5 });
    expect(rect.attribute.fillOpacity).toBe(0.5);
    expect(rect.baseAttributes?.fillOpacity).toBe(1);
  });
});
