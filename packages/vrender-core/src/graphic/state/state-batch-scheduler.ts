import type { IGraphic, IGroup, ILayer, IStage } from '../../interface';
import type { CompiledStateDefinition } from './state-definition';
import { UpdateCategory, classifyAffectedKeys } from './attribute-update-classifier';
import {
  type DeferredIneligibleReason,
  type IDeferredStateConfig,
  type IDeferredStateOwnerConfig,
  type IResolvedDeferredContext,
  type StatePerfMonitor,
  fingerprintDeferredStateConfig,
  normalizeDeferredStateConfig,
  normalizeDeferredStateOwnerConfig
} from './state-perf-monitor';

type StateBatchJobKind = 'apply_states';
type StateBatchIntentKey = string;

export interface IStateBatchJob {
  id: number;
  kind: StateBatchJobKind;
  intentKey: StateBatchIntentKey;
  status: 'pending' | 'running' | 'completed' | 'cancelled';
  targetStates: string[];
  targetStatesKey: string;
  pendingGraphics: Set<IGraphic>;
  orderedGraphics: IGraphic[];
  config: Required<IDeferredStateConfig>;
  contextOwner: IStage | ILayer | IGroup;
  contextOwnerId: number;
  configFingerprint: string;
  createdAt: number;
  processedCount: number;
}

type DeferredEligibilityResult =
  | {
      eligible: true;
      context: IResolvedDeferredContext;
      targetStatesKey: string;
    }
  | {
      eligible: false;
      reason: DeferredIneligibleReason;
    };

function isRenderableGraphic(graphic: IGraphic): boolean {
  return !!graphic.stage && (graphic as any).releaseStatus !== 'released';
}

function createTargetStatesKey(targetStates: string[]): string {
  return targetStates.length ? targetStates.join('|') : '__clear__';
}

function createIntentKey(
  contextOwnerId: number,
  configFingerprint: string,
  targetStatesKey: string
): StateBatchIntentKey {
  return `${contextOwnerId}:${configFingerprint}:${targetStatesKey}`;
}

function hasMeaningfulDeferredConfig(config?: IDeferredStateOwnerConfig): boolean {
  const normalized = normalizeDeferredStateOwnerConfig(config);
  return !!normalized && (normalized.localEnabled != null || normalized.deferred != null);
}

function getGraphicCompiledDefinitions(graphic: IGraphic): {
  compiledDefinitions?: Map<string, CompiledStateDefinition<any>>;
  stateProxyEligibility?: (stateName: string) => boolean;
} {
  const graphicAny = graphic as any;
  if (typeof graphicAny.resolveEffectiveCompiledDefinitions === 'function') {
    const result = graphicAny.resolveEffectiveCompiledDefinitions();
    return {
      compiledDefinitions: result.compiledDefinitions,
      stateProxyEligibility: result.stateProxyEligibility
    };
  }

  return {};
}

function getCurrentStateNames(graphic: IGraphic): string[] {
  return ((graphic as any).currentStates as string[] | undefined)?.slice() ?? [];
}

export class StateBatchScheduler {
  readonly jobsByIntentKey = new Map<StateBatchIntentKey, IStateBatchJob>();
  readonly pendingIntentByGraphic = new Map<IGraphic, StateBatchIntentKey>();

  private nextJobId = 1;
  private readonly runningJobs = new Map<StateBatchIntentKey, Promise<void>>();

  constructor(private readonly stage: IStage, private readonly perfMonitor?: StatePerfMonitor) {}

  schedule(graphics: IGraphic[], targetStates: string[]): void {
    const batchOperation = graphics.length > 1;

    graphics.forEach(graphic => {
      const eligibility = this.resolveEligibility(graphic, targetStates, batchOperation, true);
      if ('reason' in eligibility) {
        this.removeGraphicFromPending(graphic);
        if (eligibility.reason !== 'graphic_unavailable') {
          this.commitSynchronously(graphic, targetStates);
        }
        return;
      }

      this.enqueueDeferredIntent(graphic, targetStates, eligibility.context, eligibility.targetStatesKey);
    });
  }

  release(): void {
    this.jobsByIntentKey.forEach(job => {
      job.status = 'cancelled';
    });
    this.jobsByIntentKey.clear();
    this.pendingIntentByGraphic.clear();
    this.runningJobs.clear();
    this.perfMonitor?.updateBatchPending(0);
  }

  private resolveEligibility(
    graphic: IGraphic,
    targetStates: string[],
    batchOperation: boolean,
    recordObservability: boolean
  ): DeferredEligibilityResult {
    if (!isRenderableGraphic(graphic)) {
      if (recordObservability) {
        this.perfMonitor?.recordDeferredIneligible('graphic_unavailable');
      }
      return { eligible: false, reason: 'graphic_unavailable' };
    }

    if (!batchOperation) {
      if (recordObservability) {
        this.perfMonitor?.recordDeferredIneligible('non_batch_operation');
      }
      return { eligible: false, reason: 'non_batch_operation' };
    }

    const context = this.resolveDeferredContext(graphic);
    if (!context) {
      if (recordObservability) {
        this.perfMonitor?.recordDeferredIneligible('graphic_unavailable');
      }
      return { eligible: false, reason: 'graphic_unavailable' };
    }

    if (!context.config.enabled) {
      const normalizedOwnerConfig = normalizeDeferredStateOwnerConfig(
        (context.contextOwner as any).deferredStateConfig as IDeferredStateOwnerConfig | undefined
      );
      const reason = normalizedOwnerConfig?.localEnabled === false ? 'context_disabled' : 'config_disabled';
      if (recordObservability) {
        this.perfMonitor?.recordDeferredIneligible(reason);
      }
      return { eligible: false, reason };
    }

    const classification = this.classifyGraphicTargetStates(graphic, targetStates);
    if (classification.reason) {
      if (recordObservability) {
        this.perfMonitor?.recordDeferredIneligible(classification.reason);
      }
      return { eligible: false, reason: classification.reason };
    }

    if (classification.category !== UpdateCategory.PAINT) {
      if (recordObservability) {
        this.perfMonitor?.recordDeferredIneligible('mixed_update_category');
      }
      return { eligible: false, reason: 'mixed_update_category' };
    }

    return {
      eligible: true,
      context,
      targetStatesKey: createTargetStatesKey(targetStates)
    };
  }

  private resolveDeferredContext(graphic: IGraphic): IResolvedDeferredContext | undefined {
    const stage = graphic.stage;
    if (!stage) {
      return undefined;
    }

    let owner: IStage | ILayer | IGroup = stage;
    let config = normalizeDeferredStateConfig(undefined);

    const ownerConfigs: Array<IStage | ILayer | IGroup> = [stage];
    const parents: Array<IGroup | ILayer> = [];
    let parent = graphic.parent as any;

    while (parent && parent !== stage) {
      parents.push(parent);
      parent = parent.parent as any;
    }

    parents.reverse().forEach(current => ownerConfigs.push(current));

    ownerConfigs.forEach(current => {
      const deferredStateConfig = normalizeDeferredStateOwnerConfig(
        (current as any).deferredStateConfig as IDeferredStateOwnerConfig | undefined
      );
      if (!deferredStateConfig) {
        return;
      }

      if (deferredStateConfig.deferred) {
        config = {
          ...config,
          ...deferredStateConfig.deferred
        };
      }

      if (deferredStateConfig.localEnabled != null) {
        config.enabled = deferredStateConfig.localEnabled;
      }

      if (hasMeaningfulDeferredConfig((current as any).deferredStateConfig)) {
        owner = current;
      }
    });

    const normalized = normalizeDeferredStateConfig(config);
    return {
      contextOwner: owner,
      contextOwnerId: (owner as any)._uid ?? 0,
      config: normalized,
      configFingerprint: fingerprintDeferredStateConfig(normalized)
    };
  }

  private classifyGraphicTargetStates(
    graphic: IGraphic,
    targetStates: string[]
  ): { category: UpdateCategory; reason?: DeferredIneligibleReason } {
    const { compiledDefinitions, stateProxyEligibility } = getGraphicCompiledDefinitions(graphic);
    const candidateStates = Array.from(new Set([...getCurrentStateNames(graphic), ...targetStates]));
    let category = UpdateCategory.NONE;

    candidateStates.forEach(stateName => {
      if (stateProxyEligibility?.(stateName)) {
        category = UpdateCategory.NONE;
        return;
      }

      const definition = compiledDefinitions?.get(stateName);
      if (!definition) {
        return;
      }

      if (definition.hasResolver && definition.affectedKeys.size === 0) {
        category = UpdateCategory.NONE;
        return;
      }

      category |= classifyAffectedKeys(definition.affectedKeys);
    });

    if (
      candidateStates.some(stateName => stateProxyEligibility?.(stateName)) ||
      candidateStates.some(stateName => {
        const definition = compiledDefinitions?.get(stateName);
        return !!definition?.hasResolver && definition.affectedKeys.size === 0;
      })
    ) {
      return {
        category: UpdateCategory.NONE,
        reason: 'resolver_unstable_keys'
      };
    }

    return {
      category: category === UpdateCategory.NONE ? UpdateCategory.PAINT : category
    };
  }

  private enqueueDeferredIntent(
    graphic: IGraphic,
    targetStates: string[],
    context: IResolvedDeferredContext,
    targetStatesKey: string
  ): void {
    const nextIntentKey = createIntentKey(context.contextOwnerId, context.configFingerprint, targetStatesKey);
    const prevIntentKey = this.pendingIntentByGraphic.get(graphic);

    if (prevIntentKey === nextIntentKey) {
      this.perfMonitor?.incrementCounter('deferredJobsCoalesced');
      return;
    }

    if (prevIntentKey) {
      this.removeGraphicFromIntentJob(graphic, prevIntentKey);
    }

    let job = this.jobsByIntentKey.get(nextIntentKey);
    if (!job) {
      job = {
        id: this.nextJobId++,
        kind: 'apply_states',
        intentKey: nextIntentKey,
        status: 'pending',
        targetStates: [...targetStates],
        targetStatesKey,
        pendingGraphics: new Set(),
        orderedGraphics: [],
        config: context.config,
        contextOwner: context.contextOwner,
        contextOwnerId: context.contextOwnerId,
        configFingerprint: context.configFingerprint,
        createdAt: Date.now(),
        processedCount: 0
      };
      this.jobsByIntentKey.set(nextIntentKey, job);
      this.perfMonitor?.incrementCounter('deferredJobsCreated');
      this.perfMonitor?.updateBatchPending(this.jobsByIntentKey.size);
    } else {
      this.perfMonitor?.incrementCounter('deferredJobsCoalesced');
    }

    if (!job.pendingGraphics.has(graphic)) {
      job.pendingGraphics.add(graphic);
      job.orderedGraphics.push(graphic);
      this.pendingIntentByGraphic.set(graphic, nextIntentKey);
      this.perfMonitor?.recordAllocation('batchEntriesCreated');
      this.perfMonitor?.updateMaxGraphicsInJob(job.pendingGraphics.size);
    }

    this.ensureJobRunning(job);
  }

  private removeGraphicFromPending(graphic: IGraphic): void {
    const prevIntentKey = this.pendingIntentByGraphic.get(graphic);
    if (!prevIntentKey) {
      return;
    }
    this.removeGraphicFromIntentJob(graphic, prevIntentKey);
  }

  private removeGraphicFromIntentJob(graphic: IGraphic, intentKey: StateBatchIntentKey): void {
    const job = this.jobsByIntentKey.get(intentKey);
    if (!job) {
      this.pendingIntentByGraphic.delete(graphic);
      return;
    }

    job.pendingGraphics.delete(graphic);
    if (this.pendingIntentByGraphic.get(graphic) === intentKey) {
      this.pendingIntentByGraphic.delete(graphic);
    }

    if (job.pendingGraphics.size === 0 && job.status !== 'completed') {
      job.status = 'cancelled';
      this.jobsByIntentKey.delete(intentKey);
      this.perfMonitor?.incrementCounter('deferredJobsCancelled');
      this.perfMonitor?.recordEvent('deferred-job-cancel', {
        intentKey,
        jobId: job.id
      });
      this.perfMonitor?.updateBatchPending(this.jobsByIntentKey.size);
    }
  }

  private ensureJobRunning(job: IStateBatchJob): void {
    if (this.runningJobs.has(job.intentKey)) {
      return;
    }

    const runner = this.runJob(job).then(
      () => {
        this.runningJobs.delete(job.intentKey);
      },
      () => {
        this.runningJobs.delete(job.intentKey);
      }
    );

    this.runningJobs.set(job.intentKey, runner);
  }

  private async runJob(job: IStateBatchJob): Promise<void> {
    if ((job.status as string) === 'cancelled') {
      return;
    }

    await this.waitForNextFrame();
    if ((job.status as string) === 'cancelled') {
      return;
    }

    job.status = 'running';
    this.perfMonitor?.recordEvent('deferred-job-start', {
      intentKey: job.intentKey,
      jobId: job.id
    });

    let index = 0;
    let frameStart = performance.now();
    let processedInFrame = 0;
    let committedInSlice = 0;

    while (index < job.orderedGraphics.length) {
      if ((job.status as string) === 'cancelled') {
        return;
      }

      if (
        processedInFrame > 0 &&
        (processedInFrame >= job.config.maxGraphicsPerFrame || performance.now() - frameStart >= job.config.frameBudget)
      ) {
        this.perfMonitor?.incrementCounter('deferredBudgetYields');
        this.perfMonitor?.recordCost('batchSlice', performance.now() - frameStart);
        this.perfMonitor?.recordEvent('deferred-job-yield', {
          intentKey: job.intentKey,
          jobId: job.id,
          processedInFrame
        });
        if (committedInSlice > 0) {
          this.stage.renderNextFrame();
        }
        await this.waitForNextFrame();
        frameStart = performance.now();
        processedInFrame = 0;
        committedInSlice = 0;
      }

      const graphic = job.orderedGraphics[index++];

      if (!job.pendingGraphics.has(graphic)) {
        continue;
      }

      if (!isRenderableGraphic(graphic)) {
        job.pendingGraphics.delete(graphic);
        if (this.pendingIntentByGraphic.get(graphic) === job.intentKey) {
          this.pendingIntentByGraphic.delete(graphic);
        }
        continue;
      }

      if (this.pendingIntentByGraphic.get(graphic) !== job.intentKey) {
        job.pendingGraphics.delete(graphic);
        continue;
      }

      const nextEligibility = this.resolveEligibility(graphic, job.targetStates, true, false);
      if (!nextEligibility.eligible) {
        job.pendingGraphics.delete(graphic);
        this.pendingIntentByGraphic.delete(graphic);
        this.commitSynchronously(graphic, job.targetStates);
        continue;
      }

      const nextIntentKey = createIntentKey(
        nextEligibility.context.contextOwnerId,
        nextEligibility.context.configFingerprint,
        nextEligibility.targetStatesKey
      );

      if (nextIntentKey !== job.intentKey) {
        job.pendingGraphics.delete(graphic);
        this.pendingIntentByGraphic.delete(graphic);
        this.enqueueDeferredIntent(graphic, job.targetStates, nextEligibility.context, nextEligibility.targetStatesKey);
        continue;
      }

      this.commitSynchronously(graphic, job.targetStates);
      job.pendingGraphics.delete(graphic);
      this.pendingIntentByGraphic.delete(graphic);
      job.processedCount += 1;
      processedInFrame += 1;
      committedInSlice += 1;
      this.perfMonitor?.incrementCounter('deferredGraphicsCommitted');
    }

    if (processedInFrame > 0) {
      this.perfMonitor?.recordCost('batchSlice', performance.now() - frameStart);
      this.stage.renderNextFrame();
    }

    if (job.pendingGraphics.size === 0 && this.jobsByIntentKey.get(job.intentKey) === job) {
      job.status = 'completed';
      this.jobsByIntentKey.delete(job.intentKey);
      this.perfMonitor?.incrementCounter('deferredJobsCompleted');
      this.perfMonitor?.recordEvent('deferred-job-complete', {
        intentKey: job.intentKey,
        jobId: job.id,
        processedCount: job.processedCount
      });
      this.perfMonitor?.updateBatchPending(this.jobsByIntentKey.size);
    }
  }

  private waitForNextFrame(): Promise<void> {
    const stageGlobal = (this.stage as any).global;
    if (stageGlobal?.getSpecifiedPerformanceRAF) {
      return stageGlobal.getSpecifiedPerformanceRAF((this.stage as any).rafId).wait();
    }

    return new Promise(resolve => {
      stageGlobal?.getSpecifiedRequestAnimationFrame((this.stage as any).rafId)(() => resolve());
    });
  }

  private commitSynchronously(graphic: IGraphic, targetStates: string[]): void {
    if (!isRenderableGraphic(graphic)) {
      return;
    }

    if (!targetStates.length) {
      graphic.clearStates(false);
      return;
    }

    graphic.useStates(targetStates, false);
  }
}
