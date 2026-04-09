import { createGroup } from '../../../src/graphic/group';
import { createRect } from '../../../src/graphic/rect';
import { createSharedStateTestStage } from './shared-state-test-utils';

describe('shared-state refresh observability', () => {
  test('should record queue, flush, render scheduling and refresh cost without using deferred jobs', async () => {
    const stage = createSharedStateTestStage();
    stage.statePerfConfig = { enabled: true };
    stage.deferredStateConfig = {
      deferred: { enabled: true, frameBudget: 8, maxGraphicsPerFrame: 10 }
    };

    const owner = createGroup({});
    const rect = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'black' });

    owner.sharedStateDefinitions = {
      hover: { fill: 'red' }
    };

    stage.defaultLayer.appendChild(owner);
    owner.appendChild(rect);
    rect.useStates(['hover'], false);

    owner.sharedStateDefinitions = {
      hover: { fill: 'green' }
    };

    const beforeRenderSnapshot = stage.getStatePerfSnapshot();
    expect(beforeRenderSnapshot.refresh.queuedGraphics).toBe(1);
    expect(beforeRenderSnapshot.refresh.renderScheduled).toBe(1);
    expect(beforeRenderSnapshot.counters.deferredJobsCreated).toBe(0);

    await stage.flushAllScheduledFramesAsync();

    const snapshot = stage.getStatePerfSnapshot();
    expect(snapshot.refresh.flushedGraphics).toBe(1);
    expect(snapshot.counters.sharedRefreshCommits).toBe(1);
    expect(snapshot.cost.sharedRefreshTotalMs).toBeGreaterThanOrEqual(0);
    expect(rect.attribute.fill).toBe('green');
  });
});
