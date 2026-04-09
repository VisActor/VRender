import type { IGroup, ILayer, IStage } from '../../interface';
import { UpdateCategory } from './attribute-update-classifier';

export type DeferredIneligibleReason =
  | 'config_disabled'
  | 'context_disabled'
  | 'non_batch_operation'
  | 'mixed_update_category'
  | 'resolver_unstable_keys'
  | 'graphic_unavailable';

export interface IStatePerfConfig {
  enabled?: boolean;
  recordEvents?: boolean;
  maxEventRecords?: number;
}

export interface IDeferredStateConfig {
  enabled?: boolean;
  frameBudget?: number;
  maxGraphicsPerFrame?: number;
}

export interface IDeferredStateContextConfig {
  deferred?: IDeferredStateConfig;
  priority?: number;
  localEnabled?: boolean;
}

export type IDeferredStateOwnerConfig = IDeferredStateConfig | IDeferredStateContextConfig;

export type IStatePerfEventType =
  | 'state-commit'
  | 'shared-refresh-flush'
  | 'deferred-job-start'
  | 'deferred-job-yield'
  | 'deferred-job-cancel'
  | 'deferred-job-complete'
  | 'deferred-ineligible';

export interface IStatePerfEventRecord {
  type: IStatePerfEventType;
  at: number;
  detail?: Record<string, unknown>;
}

export interface IStatePerfSnapshot {
  counters: {
    stateCommits: number;
    sharedRefreshCommits: number;
    deferredJobsCreated: number;
    deferredJobsCompleted: number;
    deferredJobsCancelled: number;
    deferredJobsCoalesced: number;
    deferredGraphicsCommitted: number;
    deferredBudgetYields: number;
    deferredIneligibleGraphics: number;
  };
  deferredIneligibleByReason: Record<DeferredIneligibleReason, number>;
  categoryBreakdown: {
    paint: number;
    transform: number;
    shape: number;
    bounds: number;
    layout: number;
    pick: number;
  };
  refresh: {
    queuedGraphics: number;
    flushedGraphics: number;
    ensureFreshCalls: number;
    renderScheduled: number;
  };
  resolver: {
    cacheHits: number;
    cacheMisses: number;
    invalidations: number;
  };
  cost: {
    resolverTotalMs: number;
    resolverMaxMs: number;
    patchTotalMs: number;
    patchMaxMs: number;
    sharedRefreshTotalMs: number;
    sharedRefreshMaxMs: number;
    batchSliceTotalMs: number;
    batchSliceMaxMs: number;
  };
  allocationHints: {
    patchObjectsCreated: number;
    batchEntriesCreated: number;
    refreshQueuePushes: number;
  };
  batch: {
    pendingJobs: number;
    maxPendingJobs: number;
    maxGraphicsInJob: number;
    maxFrameSliceCost: number;
  };
  events?: IStatePerfEventRecord[];
}

type SnapshotCounterKey = keyof IStatePerfSnapshot['counters'];
type SnapshotRefreshKey = keyof IStatePerfSnapshot['refresh'];
type SnapshotResolverKey = keyof IStatePerfSnapshot['resolver'];
type SnapshotAllocationKey = keyof IStatePerfSnapshot['allocationHints'];
type SnapshotCostKind = 'resolver' | 'patch' | 'sharedRefresh' | 'batchSlice';

export interface IResolvedDeferredContext {
  contextOwner: IStage | ILayer | IGroup;
  contextOwnerId: number;
  config: Required<IDeferredStateConfig>;
  configFingerprint: string;
}

const DEFAULT_MAX_EVENT_RECORDS = 100;
const STAGE_PERF_MONITOR = Symbol('vrender.statePerfMonitor');

function createReasonBreakdown(): Record<DeferredIneligibleReason, number> {
  return {
    config_disabled: 0,
    context_disabled: 0,
    non_batch_operation: 0,
    mixed_update_category: 0,
    resolver_unstable_keys: 0,
    graphic_unavailable: 0
  };
}

export function createEmptyStatePerfSnapshot(): IStatePerfSnapshot {
  return {
    counters: {
      stateCommits: 0,
      sharedRefreshCommits: 0,
      deferredJobsCreated: 0,
      deferredJobsCompleted: 0,
      deferredJobsCancelled: 0,
      deferredJobsCoalesced: 0,
      deferredGraphicsCommitted: 0,
      deferredBudgetYields: 0,
      deferredIneligibleGraphics: 0
    },
    deferredIneligibleByReason: createReasonBreakdown(),
    categoryBreakdown: {
      paint: 0,
      transform: 0,
      shape: 0,
      bounds: 0,
      layout: 0,
      pick: 0
    },
    refresh: {
      queuedGraphics: 0,
      flushedGraphics: 0,
      ensureFreshCalls: 0,
      renderScheduled: 0
    },
    resolver: {
      cacheHits: 0,
      cacheMisses: 0,
      invalidations: 0
    },
    cost: {
      resolverTotalMs: 0,
      resolverMaxMs: 0,
      patchTotalMs: 0,
      patchMaxMs: 0,
      sharedRefreshTotalMs: 0,
      sharedRefreshMaxMs: 0,
      batchSliceTotalMs: 0,
      batchSliceMaxMs: 0
    },
    allocationHints: {
      patchObjectsCreated: 0,
      batchEntriesCreated: 0,
      refreshQueuePushes: 0
    },
    batch: {
      pendingJobs: 0,
      maxPendingJobs: 0,
      maxGraphicsInJob: 0,
      maxFrameSliceCost: 0
    },
    events: []
  };
}

function cloneSnapshot(snapshot: IStatePerfSnapshot): IStatePerfSnapshot {
  return {
    counters: { ...snapshot.counters },
    deferredIneligibleByReason: { ...snapshot.deferredIneligibleByReason },
    categoryBreakdown: { ...snapshot.categoryBreakdown },
    refresh: { ...snapshot.refresh },
    resolver: { ...snapshot.resolver },
    cost: { ...snapshot.cost },
    allocationHints: { ...snapshot.allocationHints },
    batch: { ...snapshot.batch },
    events: snapshot.events ? snapshot.events.slice() : []
  };
}

function isDeferredStateContextConfig(
  value: IDeferredStateOwnerConfig | undefined
): value is IDeferredStateContextConfig {
  return (
    !!value &&
    (Object.prototype.hasOwnProperty.call(value, 'deferred') ||
      Object.prototype.hasOwnProperty.call(value, 'localEnabled'))
  );
}

export function normalizeDeferredStateOwnerConfig(
  value?: IDeferredStateOwnerConfig
): IDeferredStateContextConfig | undefined {
  if (!value) {
    return undefined;
  }

  if (isDeferredStateContextConfig(value)) {
    return value;
  }

  return {
    deferred: value
  };
}

export function normalizeDeferredStateConfig(config?: IDeferredStateConfig): Required<IDeferredStateConfig> {
  return {
    enabled: config?.enabled ?? false,
    frameBudget: config?.frameBudget ?? 8,
    maxGraphicsPerFrame: config?.maxGraphicsPerFrame ?? 100
  };
}

export function fingerprintDeferredStateConfig(config: Required<IDeferredStateConfig>): string {
  return `${config.enabled ? 1 : 0}:${config.frameBudget}:${config.maxGraphicsPerFrame}`;
}

export class StatePerfMonitor {
  private readonly snapshot = createEmptyStatePerfSnapshot();

  constructor(private configSource?: IStatePerfConfig | (() => IStatePerfConfig | undefined)) {}

  setConfig(config?: IStatePerfConfig): void {
    this.configSource = config;
  }

  getSnapshot(): IStatePerfSnapshot {
    return cloneSnapshot(this.snapshot);
  }

  reset(): void {
    const next = createEmptyStatePerfSnapshot();
    Object.assign(this.snapshot.counters, next.counters);
    Object.assign(this.snapshot.deferredIneligibleByReason, next.deferredIneligibleByReason);
    Object.assign(this.snapshot.categoryBreakdown, next.categoryBreakdown);
    Object.assign(this.snapshot.refresh, next.refresh);
    Object.assign(this.snapshot.resolver, next.resolver);
    Object.assign(this.snapshot.cost, next.cost);
    Object.assign(this.snapshot.allocationHints, next.allocationHints);
    Object.assign(this.snapshot.batch, next.batch);
    this.snapshot.events = [];
  }

  incrementCounter(key: SnapshotCounterKey, delta: number = 1): void {
    if (!this.isEnabled()) {
      return;
    }
    this.snapshot.counters[key] += delta;
  }

  recordDeferredIneligible(reason: DeferredIneligibleReason, delta: number = 1): void {
    if (!this.isEnabled()) {
      return;
    }
    this.snapshot.deferredIneligibleByReason[reason] += delta;
    this.snapshot.counters.deferredIneligibleGraphics += delta;
    this.recordEvent('deferred-ineligible', { reason, count: delta });
  }

  recordCategory(category: UpdateCategory): void {
    if (!this.isEnabled()) {
      return;
    }
    if (category & UpdateCategory.PAINT) {
      this.snapshot.categoryBreakdown.paint += 1;
    }
    if (category & UpdateCategory.TRANSFORM) {
      this.snapshot.categoryBreakdown.transform += 1;
    }
    if (category & UpdateCategory.SHAPE) {
      this.snapshot.categoryBreakdown.shape += 1;
    }
    if (category & UpdateCategory.BOUNDS) {
      this.snapshot.categoryBreakdown.bounds += 1;
    }
    if (category & UpdateCategory.LAYOUT) {
      this.snapshot.categoryBreakdown.layout += 1;
    }
    if (category & UpdateCategory.PICK) {
      this.snapshot.categoryBreakdown.pick += 1;
    }
  }

  recordRefresh(key: SnapshotRefreshKey, delta: number = 1): void {
    if (!this.isEnabled()) {
      return;
    }
    this.snapshot.refresh[key] += delta;
  }

  recordResolver(key: SnapshotResolverKey, delta: number = 1): void {
    if (!this.isEnabled()) {
      return;
    }
    this.snapshot.resolver[key] += delta;
  }

  recordCost(kind: SnapshotCostKind, durationMs: number): void {
    if (!this.isEnabled()) {
      return;
    }
    if (kind === 'resolver') {
      this.snapshot.cost.resolverTotalMs += durationMs;
      this.snapshot.cost.resolverMaxMs = Math.max(this.snapshot.cost.resolverMaxMs, durationMs);
      return;
    }
    if (kind === 'patch') {
      this.snapshot.cost.patchTotalMs += durationMs;
      this.snapshot.cost.patchMaxMs = Math.max(this.snapshot.cost.patchMaxMs, durationMs);
      return;
    }
    if (kind === 'sharedRefresh') {
      this.snapshot.cost.sharedRefreshTotalMs += durationMs;
      this.snapshot.cost.sharedRefreshMaxMs = Math.max(this.snapshot.cost.sharedRefreshMaxMs, durationMs);
      return;
    }

    this.snapshot.cost.batchSliceTotalMs += durationMs;
    this.snapshot.cost.batchSliceMaxMs = Math.max(this.snapshot.cost.batchSliceMaxMs, durationMs);
    this.snapshot.batch.maxFrameSliceCost = Math.max(this.snapshot.batch.maxFrameSliceCost, durationMs);
  }

  recordAllocation(key: SnapshotAllocationKey, delta: number = 1): void {
    if (!this.isEnabled()) {
      return;
    }
    this.snapshot.allocationHints[key] += delta;
  }

  updateBatchPending(pendingJobs: number): void {
    if (!this.isEnabled()) {
      return;
    }
    this.snapshot.batch.pendingJobs = pendingJobs;
    this.snapshot.batch.maxPendingJobs = Math.max(this.snapshot.batch.maxPendingJobs, pendingJobs);
  }

  updateMaxGraphicsInJob(count: number): void {
    if (!this.isEnabled()) {
      return;
    }
    this.snapshot.batch.maxGraphicsInJob = Math.max(this.snapshot.batch.maxGraphicsInJob, count);
  }

  recordEvent(type: IStatePerfEventType, detail?: Record<string, unknown>): void {
    if (!this.shouldRecordEvents()) {
      return;
    }
    const events = this.snapshot.events ?? (this.snapshot.events = []);
    events.push({
      type,
      at: Date.now(),
      detail
    });
    const max = this.getConfig()?.maxEventRecords ?? DEFAULT_MAX_EVENT_RECORDS;
    if (events.length > max) {
      events.splice(0, events.length - max);
    }
  }

  private isEnabled(): boolean {
    return this.getConfig()?.enabled === true;
  }

  private shouldRecordEvents(): boolean {
    const config = this.getConfig();
    return !!config?.enabled && !!config.recordEvents;
  }

  private getConfig(): IStatePerfConfig | undefined {
    return typeof this.configSource === 'function' ? this.configSource() : this.configSource;
  }
}

export function ensureStageStatePerfMonitor(stage: IStage): StatePerfMonitor {
  const stageAny = stage as any;
  if (!stageAny[STAGE_PERF_MONITOR]) {
    stageAny[STAGE_PERF_MONITOR] = new StatePerfMonitor(() => (stage as any).statePerfConfig);
  }

  return stageAny[STAGE_PERF_MONITOR] as StatePerfMonitor;
}

export function getStageStatePerfMonitor(stage?: IStage): StatePerfMonitor | undefined {
  if (!stage) {
    return undefined;
  }
  return (stage as any)[STAGE_PERF_MONITOR] as StatePerfMonitor | undefined;
}
