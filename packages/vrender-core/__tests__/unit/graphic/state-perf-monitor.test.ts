import { UpdateCategory } from '../../../src/graphic/state/attribute-update-classifier';
import {
  type IStatePerfEventRecord,
  StatePerfMonitor,
  type DeferredIneligibleReason
} from '../../../src/graphic/state/state-perf-monitor';

describe('StatePerfMonitor', () => {
  test('should record counters, reasons, cost, allocation hints and bounded events', () => {
    const monitor = new StatePerfMonitor({
      enabled: true,
      recordEvents: true,
      maxEventRecords: 2
    });

    monitor.incrementCounter('stateCommits');
    monitor.incrementCounter('deferredJobsCreated', 2);
    monitor.recordDeferredIneligible('non_batch_operation');
    monitor.recordDeferredIneligible('mixed_update_category', 2);
    monitor.recordCategory(UpdateCategory.PAINT | UpdateCategory.BOUNDS);
    monitor.recordResolver('cacheHits');
    monitor.recordResolver('invalidations');
    monitor.recordRefresh('queuedGraphics', 3);
    monitor.recordRefresh('renderScheduled');
    monitor.recordCost('resolver', 1.5);
    monitor.recordCost('patch', 2.5);
    monitor.recordAllocation('patchObjectsCreated');
    monitor.recordAllocation('batchEntriesCreated', 2);
    monitor.updateBatchPending(2);
    monitor.updateMaxGraphicsInJob(3);
    monitor.recordEvent('deferred-ineligible', {
      reason: 'non_batch_operation' as DeferredIneligibleReason
    });
    monitor.recordEvent('deferred-job-start', { intentKey: 'owner:cfg:hover' });
    monitor.recordEvent('deferred-job-complete', { intentKey: 'owner:cfg:hover' });

    const snapshot = monitor.getSnapshot();

    expect(snapshot.counters.stateCommits).toBe(1);
    expect(snapshot.counters.deferredJobsCreated).toBe(2);
    expect(snapshot.deferredIneligibleByReason.non_batch_operation).toBe(1);
    expect(snapshot.deferredIneligibleByReason.mixed_update_category).toBe(2);
    expect(snapshot.categoryBreakdown.paint).toBe(1);
    expect(snapshot.categoryBreakdown.bounds).toBe(1);
    expect(snapshot.resolver.cacheHits).toBe(1);
    expect(snapshot.resolver.invalidations).toBe(1);
    expect(snapshot.refresh.queuedGraphics).toBe(3);
    expect(snapshot.refresh.renderScheduled).toBe(1);
    expect(snapshot.cost.resolverTotalMs).toBeCloseTo(1.5);
    expect(snapshot.cost.patchMaxMs).toBeCloseTo(2.5);
    expect(snapshot.allocationHints.patchObjectsCreated).toBe(1);
    expect(snapshot.allocationHints.batchEntriesCreated).toBe(2);
    expect(snapshot.batch.pendingJobs).toBe(2);
    expect(snapshot.batch.maxPendingJobs).toBe(2);
    expect(snapshot.batch.maxGraphicsInJob).toBe(3);
    expect(snapshot.events).toHaveLength(2);
    expect(snapshot.events?.map((event: IStatePerfEventRecord) => event.type)).toEqual([
      'deferred-job-start',
      'deferred-job-complete'
    ]);
  });

  test('should reset the snapshot back to an empty baseline', () => {
    const monitor = new StatePerfMonitor({
      enabled: true,
      recordEvents: true
    });

    monitor.incrementCounter('stateCommits', 3);
    monitor.recordDeferredIneligible('graphic_unavailable');
    monitor.recordEvent('state-commit', {});

    monitor.reset();

    const snapshot = monitor.getSnapshot();

    expect(snapshot.counters.stateCommits).toBe(0);
    expect(snapshot.deferredIneligibleByReason.graphic_unavailable).toBe(0);
    expect(snapshot.events).toEqual([]);
  });
});
