/** @jest-environment node */
import { createNodeSmokeStage } from './node-smoke-stage';
import { registerGroupGraphic } from '../../../src/register/register-group';
import { registerShadowRootGraphic } from '../../../src/register/register-shadowRoot';
import { createRect } from '../../../src/graphic/rect';
import type { IStageParams } from '../../../src/interface';

describe('interactive layer mode', () => {
  beforeAll(() => {
    registerGroupGraphic();
    registerShadowRootGraphic();
  });
  test.each([
    ['disabled', { interactiveLayer: false }, false],
    ['virtual', { interactiveLayerMode: 'virtual' }, true],
    ['explicit enabled', { interactiveLayer: true, interactiveLayerMode: 'virtual' }, true],
    ['disabled with mode', { interactiveLayer: false, interactiveLayerMode: 'virtual' }, false]
  ] as [string, Partial<IStageParams>, boolean][])('%s', (_, options, enabled) => {
    const stage = createNodeSmokeStage({
      width: 100,
      height: 100,
      autoRender: false,
      autoRefresh: false,
      event: false,
      ...options
    });
    try {
      stage.tryInitInteractiveLayer();
      const layer = stage.getLayer('_builtin_interactive');
      expect(Boolean(layer)).toBe(enabled);
      expect(stage.childrenCount).toBe(enabled ? 2 : 1);
      if (layer) {
        expect(layer.layerMode).toBe('virtual');
        expect(layer.parent).toBe(stage);
        expect(layer.getNativeHandler().canvas).toBeNull();
        const rect = createRect({ x: 10, y: 10, width: 20, height: 20, fill: 'red', globalZIndex: 1 });
        stage.defaultLayer.add(rect);
        stage.render();
        expect(rect.interactiveGraphic?.baseGraphic).toBe(rect);
        expect(rect.interactiveGraphic?.parent).toBe(layer.getElementById('_interactive_group')?.shadowRoot);
      }
    } finally {
      stage.release();
    }
  });
});
