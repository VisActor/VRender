/** @jest-environment node */
import { createNodeSmokeStage } from './node-smoke-stage';
import { createRect } from '../../../src/graphic/rect';
import type { IStageParams } from '../../../src/interface';

// The node smoke canvas is single-layer. Physical-layer combinations are covered by browser rendering.
describe('interactive group and disabled container options', () => {
  test.each([
    ['disabled', { interactiveLayer: false }, false, false],
    ['group enabled', { interactiveGroup: true }, true, true],
    ['both enabled', { interactiveLayer: true, interactiveGroup: true }, true, true],
    ['group without a layer', { interactiveLayer: false, interactiveGroup: true }, true, true],
    ['both disabled', { interactiveLayer: false, interactiveGroup: false }, false, false]
  ] as [string, Partial<IStageParams>, boolean, boolean][])('%s', (_, options, useGroup, enabled) => {
    const stage = createNodeSmokeStage({
      width: 100,
      height: 100,
      autoRender: false,
      autoRefresh: false,
      event: false,
      ...options
    });
    try {
      const container = stage.getInteractiveContainer();
      expect(Boolean(container)).toBe(enabled);
      expect(stage.childrenCount).toBe(enabled && !useGroup ? 2 : 1);
      if (container) {
        expect(container.parent).toBe(useGroup ? stage.defaultLayer : stage);
        const rect = createRect({ x: 10, y: 10, width: 20, height: 20, fill: 'red', globalZIndex: 1 });
        stage.defaultLayer.add(rect);
        stage.render();
        expect(rect.interactiveGraphic?.baseGraphic).toBe(rect);
        expect(rect.interactiveGraphic?.parent).toBe(container.getElementById('_interactive_group')?.shadowRoot);
      }
    } finally {
      stage.release();
    }
  });
});
