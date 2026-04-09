import { createRect } from '../../../src/graphic/rect';
import { createSharedStateTestStage } from './shared-state-test-utils';

describe('StateBatchScheduler', () => {
  test('should defer paint-only state commits and keep per-graphic committed snapshots atomic', async () => {
    const stage = createSharedStateTestStage();
    stage.statePerfConfig = { enabled: true };
    stage.deferredStateConfig = {
      deferred: { enabled: true, frameBudget: 8, maxGraphicsPerFrame: 1 }
    };

    const rectA = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'black' });
    const rectB = createRect({ x: 20, y: 0, width: 10, height: 10, fill: 'black' });
    rectA.states = { hover: { fill: 'red' } };
    rectB.states = { hover: { fill: 'red' } };

    stage.defaultLayer.appendChild(rectA);
    stage.defaultLayer.appendChild(rectB);
    stage.scheduleStateBatch([rectA, rectB], ['hover']);

    expect(rectA.currentStates ?? []).toEqual([]);
    expect(rectB.currentStates ?? []).toEqual([]);
    expect(rectA.attribute.fill).toBe('black');
    expect(rectB.attribute.fill).toBe('black');

    await stage.flushScheduledFramesAsync();

    const firstCommitted = [rectA, rectB].filter(rect => rect.attribute.fill === 'red');
    expect(firstCommitted).toHaveLength(1);
    expect(firstCommitted[0].currentStates).toEqual(['hover']);
    const firstPending = firstCommitted[0] === rectA ? rectB : rectA;
    expect(firstPending.currentStates ?? []).toEqual([]);
    expect(firstPending.attribute.fill).toBe('black');

    await stage.flushAllScheduledFramesAsync();

    expect(rectA.currentStates).toEqual(['hover']);
    expect(rectB.currentStates).toEqual(['hover']);
    expect(rectA.attribute.fill).toBe('red');
    expect(rectB.attribute.fill).toBe('red');

    const snapshot = stage.getStatePerfSnapshot();
    expect(snapshot.counters.deferredJobsCreated).toBe(1);
    expect(snapshot.counters.deferredGraphicsCommitted).toBe(2);
    expect(snapshot.counters.deferredBudgetYields).toBeGreaterThanOrEqual(1);
  });

  test('should let the last intent win for graphics that are still pending', async () => {
    const stage = createSharedStateTestStage();
    stage.statePerfConfig = { enabled: true };
    stage.deferredStateConfig = {
      deferred: { enabled: true, frameBudget: 8, maxGraphicsPerFrame: 1 }
    };

    const rectA = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'black' });
    const rectB = createRect({ x: 20, y: 0, width: 10, height: 10, fill: 'black' });
    rectA.states = {
      hover: { fill: 'red' },
      selected: { fill: 'blue' }
    };
    rectB.states = {
      hover: { fill: 'red' },
      selected: { fill: 'blue' }
    };

    stage.defaultLayer.appendChild(rectA);
    stage.defaultLayer.appendChild(rectB);
    stage.scheduleStateBatch([rectA, rectB], ['hover']);
    stage.scheduleStateBatch([rectA, rectB], ['selected']);
    await stage.flushAllScheduledFramesAsync();

    expect(rectA.currentStates).toEqual(['selected']);
    expect(rectB.currentStates).toEqual(['selected']);
    expect(rectA.attribute.fill).toBe('blue');
    expect(rectB.attribute.fill).toBe('blue');

    const snapshot = stage.getStatePerfSnapshot();
    expect(snapshot.counters.deferredJobsCreated).toBe(2);
    expect(snapshot.counters.deferredJobsCancelled).toBeGreaterThanOrEqual(1);
  });
});
