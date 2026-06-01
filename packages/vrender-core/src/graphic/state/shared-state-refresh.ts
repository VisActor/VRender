import type { IGraphic, IStage } from '../../interface';
import type { SharedStateScope } from './shared-state-scope';

export function scheduleStageSharedStateRefresh(stage: IStage | undefined): void {
  if (!stage || (stage as any).releaseStatus === 'released') {
    return;
  }

  stage.renderNextFrame();
}

export function enqueueGraphicSharedStateRefresh(stage: IStage | undefined, graphic: IGraphic): void {
  if (!stage) {
    return;
  }

  const pending =
    ((stage as any)._pendingSharedStateRefreshGraphics as Set<IGraphic> | undefined) ??
    (((stage as any)._pendingSharedStateRefreshGraphics = new Set<IGraphic>()) as Set<IGraphic>);

  pending.add(graphic);
}

export function markScopeActiveDescendantsDirty<T extends Record<string, any> = Record<string, any>>(
  scope: SharedStateScope<T>,
  stage?: IStage
): void {
  if (!scope.subtreeActiveDescendants.size) {
    return;
  }

  scope.subtreeActiveDescendants.forEach(graphic => {
    (graphic as any).sharedStateDirty = true;
    const ownerStage = stage ?? graphic.stage ?? scope.ownerStage;
    enqueueGraphicSharedStateRefresh(ownerStage, graphic);
  });

  scheduleStageSharedStateRefresh(stage ?? scope.ownerStage);
}

export function flushStageSharedStateRefresh(stage: IStage): void {
  const pending = (stage as any)._pendingSharedStateRefreshGraphics as Set<IGraphic> | undefined;
  if (!pending || !pending.size) {
    return;
  }

  const graphics = Array.from(pending.values());
  pending.clear();

  graphics.forEach(graphic => {
    if ((graphic as any).releaseStatus === 'released') {
      return;
    }
    if (graphic.stage !== stage) {
      return;
    }
    if (!(graphic as any).sharedStateDirty) {
      return;
    }

    (graphic as any).refreshSharedStateBeforeRender();
  });
}
