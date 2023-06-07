import { createStage as createStageFn, Stage } from '@visactor/vrender';

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
