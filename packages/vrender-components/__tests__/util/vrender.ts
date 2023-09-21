import type { Stage } from '@visactor/vrender-core';
import { createStage as createStageFn } from '@visactor/vrender-core';

export function createStage(canvasId: string, width = 600, height = 600): Stage {
  // 创建舞台实例
  const stage = createStageFn({
    canvas: canvasId,
    width,
    height,
    autoRender: true,
    background: '#eee'
  });

  return stage;
}
