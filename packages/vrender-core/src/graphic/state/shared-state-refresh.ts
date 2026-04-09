import type { IGraphic, IStage } from '../../interface';
import type { SharedStateScope } from './shared-state-scope';
import { getStageStatePerfMonitor } from './state-perf-monitor';

export function scheduleStageSharedStateRefresh(stage: IStage | undefined): void {
  if (!stage || (stage as any).releaseStatus === 'released') {
    return;
  }

  getStageStatePerfMonitor(stage)?.recordRefresh('renderScheduled');
  stage.renderNextFrame();
}

export function enqueueGraphicSharedStateRefresh(stage: IStage | undefined, graphic: IGraphic): void {
  if (!stage) {
    return;
  }

  const pending =
    ((stage as any)._pendingSharedStateRefreshGraphics as Set<IGraphic> | undefined) ??
    (((stage as any)._pendingSharedStateRefreshGraphics = new Set<IGraphic>()) as Set<IGraphic>);

  if (!pending.has(graphic)) {
    pending.add(graphic);
    const perfMonitor = getStageStatePerfMonitor(stage);
    perfMonitor?.recordRefresh('queuedGraphics');
    perfMonitor?.recordAllocation('refreshQueuePushes');
  }
}

export function markScopeActiveDescendantsDirty<T extends Record<string, any> = Record<string, any>>(
  scope: SharedStateScope<T>,
  stage?: IStage
): void {
  let marked = false;
  scope.subtreeActiveDescendants.forEach(graphic => {
    (graphic as any).sharedStateDirty = true;
    const ownerStage = stage ?? graphic.stage ?? scope.ownerStage;
    enqueueGraphicSharedStateRefresh(ownerStage, graphic);
    marked = true;
  });

  if (marked) {
    scheduleStageSharedStateRefresh(stage ?? scope.ownerStage);
  }
}

export function flushStageSharedStateRefresh(stage: IStage): void {
  const pending = (stage as any)._pendingSharedStateRefreshGraphics as Set<IGraphic> | undefined;
  if (!pending || !pending.size) {
    return;
  }

  const perfMonitor = getStageStatePerfMonitor(stage);
  const start = perfMonitor ? performance.now() : 0;
  const graphics = Array.from(pending.values());
  pending.clear();
  perfMonitor?.recordRefresh('flushedGraphics', graphics.length);

  graphics.forEach(graphic => {
    if ((graphic as any).releaseStatus === 'released') {
      return;
    }
    if (graphic.stage !== stage) {
      return;
    }

    const refresh = (graphic as any).refreshSharedStateBeforeRender;
    if (typeof refresh === 'function') {
      refresh.call(graphic);
      perfMonitor?.incrementCounter('sharedRefreshCommits');
    }
  });

  if (perfMonitor) {
    perfMonitor.recordCost('sharedRefresh', performance.now() - start);
    perfMonitor.recordEvent('shared-refresh-flush', {
      stageId: (stage as any)._uid,
      flushedGraphics: graphics.length
    });
  }
}
