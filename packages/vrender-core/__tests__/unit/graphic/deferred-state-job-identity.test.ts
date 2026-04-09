import { createGroup } from '../../../src/graphic/group';
import { createRect } from '../../../src/graphic/rect';
import { createSharedStateTestStage } from './shared-state-test-utils';

describe('deferred state job identity', () => {
  test('should not merge graphics from different context owners into the same deferred job', () => {
    const stage = createSharedStateTestStage();
    stage.statePerfConfig = { enabled: true };
    stage.deferredStateConfig = {
      deferred: { enabled: true, frameBudget: 8, maxGraphicsPerFrame: 5 }
    };

    const ownerA = createGroup({});
    const ownerB = createGroup({});
    ownerA.deferredStateConfig = { localEnabled: true, deferred: { enabled: true, maxGraphicsPerFrame: 5 } };
    ownerB.deferredStateConfig = { localEnabled: true, deferred: { enabled: true, maxGraphicsPerFrame: 5 } };

    const rectA = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'black' });
    const rectB = createRect({ x: 20, y: 0, width: 10, height: 10, fill: 'black' });
    rectA.states = { hover: { fill: 'red' } };
    rectB.states = { hover: { fill: 'red' } };

    stage.defaultLayer.appendChild(ownerA);
    stage.defaultLayer.appendChild(ownerB);
    ownerA.appendChild(rectA);
    ownerB.appendChild(rectB);

    stage.scheduleStateBatch([rectA, rectB], ['hover']);

    const snapshot = stage.getStatePerfSnapshot();
    expect(snapshot.counters.deferredJobsCreated).toBe(2);
    expect(snapshot.batch.pendingJobs).toBe(2);
    expect(snapshot.batch.maxPendingJobs).toBe(2);
  });

  test('should migrate pending graphics to a new identity when they are reparented before commit', async () => {
    const stage = createSharedStateTestStage();
    stage.statePerfConfig = { enabled: true };
    stage.deferredStateConfig = {
      deferred: { enabled: true, frameBudget: 8, maxGraphicsPerFrame: 1 }
    };

    const ownerA = createGroup({});
    const ownerB = createGroup({});
    ownerA.deferredStateConfig = { localEnabled: true, deferred: { enabled: true, maxGraphicsPerFrame: 1 } };
    ownerB.deferredStateConfig = { localEnabled: true, deferred: { enabled: true, maxGraphicsPerFrame: 2 } };

    const rect = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'black' });
    const sibling = createRect({ x: 20, y: 0, width: 10, height: 10, fill: 'black' });
    rect.states = { hover: { fill: 'red' } };
    sibling.states = { hover: { fill: 'red' } };

    stage.defaultLayer.appendChild(ownerA);
    stage.defaultLayer.appendChild(ownerB);
    ownerA.appendChild(rect);
    ownerA.appendChild(sibling);

    stage.scheduleStateBatch([rect, sibling], ['hover']);
    ownerA.removeChild(rect);
    ownerB.appendChild(rect);

    await stage.flushAllScheduledFramesAsync();

    expect(rect.currentStates).toEqual(['hover']);
    expect(rect.attribute.fill).toBe('red');
    expect(stage.getStatePerfSnapshot().counters.deferredJobsCreated).toBeGreaterThanOrEqual(2);
  });
});
