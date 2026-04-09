import { createRect } from '../../../src/graphic/rect';
import { createSharedStateTestStage } from './shared-state-test-utils';

describe('deferred state eligibility', () => {
  test('should keep single-graphic operations on the sync path and record non_batch_operation', () => {
    const stage = createSharedStateTestStage();
    stage.statePerfConfig = { enabled: true };
    stage.deferredStateConfig = {
      deferred: { enabled: true, frameBudget: 8, maxGraphicsPerFrame: 10 }
    };

    const rect = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'black' });
    rect.states = {
      hover: { fill: 'red' }
    };

    stage.defaultLayer.appendChild(rect);
    stage.scheduleStateBatch([rect], ['hover']);

    expect(rect.attribute.fill).toBe('red');
    expect(rect.currentStates).toEqual(['hover']);
    expect(stage.getStatePerfSnapshot().deferredIneligibleByReason.non_batch_operation).toBe(1);
    expect(stage.getScheduledFrameCount()).toBe(0);
  });

  test('should reject non paint-only updates from deferred and keep them on the sync path', () => {
    const stage = createSharedStateTestStage();
    stage.statePerfConfig = { enabled: true };
    stage.deferredStateConfig = {
      deferred: { enabled: true, frameBudget: 8, maxGraphicsPerFrame: 10 }
    };

    const rectA = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'black' });
    const rectB = createRect({ x: 20, y: 0, width: 10, height: 10, fill: 'black' });
    rectA.states = {
      focus: { lineWidth: 3 }
    };
    rectB.states = {
      focus: { lineWidth: 3 }
    };

    stage.defaultLayer.appendChild(rectA);
    stage.defaultLayer.appendChild(rectB);
    stage.scheduleStateBatch([rectA, rectB], ['focus']);

    expect(rectA.attribute.lineWidth).toBe(3);
    expect(rectB.attribute.lineWidth).toBe(3);
    expect(stage.getScheduledFrameCount()).toBe(0);
    expect(stage.getStatePerfSnapshot().deferredIneligibleByReason.mixed_update_category).toBe(2);
  });

  test('should reject resolver states without stable affected keys', () => {
    const stage = createSharedStateTestStage();
    stage.statePerfConfig = { enabled: true };
    stage.deferredStateConfig = {
      deferred: { enabled: true, frameBudget: 8, maxGraphicsPerFrame: 10 }
    };

    const rectA = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'black' });
    const rectB = createRect({ x: 20, y: 0, width: 10, height: 10, fill: 'black' });
    const resolver = () => ({ fill: 'orange' });

    rectA.states = { hover: { name: 'hover', resolver } };
    rectB.states = { hover: { name: 'hover', resolver } };

    stage.defaultLayer.appendChild(rectA);
    stage.defaultLayer.appendChild(rectB);
    stage.scheduleStateBatch([rectA, rectB], ['hover']);

    expect(rectA.attribute.fill).toBe('orange');
    expect(rectB.attribute.fill).toBe('orange');
    expect(stage.getScheduledFrameCount()).toBe(0);
    expect(stage.getStatePerfSnapshot().deferredIneligibleByReason.resolver_unstable_keys).toBe(2);
  });
});
