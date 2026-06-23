import type { IAnimate, IGraphic, IGroup } from '@visactor/vrender-core';

export type ExitReleaseCallbackState = {
  finalized: boolean;
  removeFromParent: boolean;
  onComplete: (() => void)[];
};

export type AnimateExitReleaseState = ExitReleaseCallbackState & {
  pendingAnimates: Set<IAnimate>;
};

export function collectTrackedAnimates(
  graphic: IGraphic,
  animates: IAnimate[] = [],
  visited: Set<IAnimate> = new Set()
): IAnimate[] {
  const trackedAnimates = (graphic as any).getTrackedAnimates?.() ?? (graphic as any).animates;

  trackedAnimates?.forEach((animate: IAnimate) => {
    if (animate && !visited.has(animate)) {
      visited.add(animate);
      animates.push(animate);
    }
  });

  (graphic as IGroup).forEachChildren?.((child: IGraphic) => {
    collectTrackedAnimates(child, animates, visited);
  });

  return animates;
}

export function appendExitReleaseCallback(state: ExitReleaseCallbackState | undefined, callback?: () => void) {
  if (callback) {
    state?.onComplete.push(callback);
  }
}

export function runExitReleaseCallbacks(callbacks: (() => void)[]) {
  callbacks.forEach(callback => {
    callback();
  });
}

export function bindExitReleaseAnimates<T extends AnimateExitReleaseState>(
  exitAnimates: IAnimate[],
  getState: () => T | undefined,
  finalize: () => void
) {
  const finish = (animate: IAnimate) => {
    const state = getState();
    if (!state || state.finalized || !state.pendingAnimates.has(animate)) {
      return;
    }

    state.pendingAnimates.delete(animate);
    if (!state.pendingAnimates.size) {
      finalize();
    }
  };

  exitAnimates.forEach(animate => {
    animate.onEnd(() => finish(animate));
    animate.onRemove(() => finish(animate));
  });
}
