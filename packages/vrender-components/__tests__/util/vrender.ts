import { createStage as createStageFn, type Stage } from '@visactor/vrender-core';

export function createStage(canvasId: string, width = 600, height = 600): Stage {
  return createStageFn({
    canvas: canvasId,
    width,
    height,
    autoRender: true,
    background: '#eee'
  }) as unknown as Stage;
}
