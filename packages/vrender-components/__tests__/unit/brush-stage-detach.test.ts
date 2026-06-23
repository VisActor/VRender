import type { Stage } from '@visactor/vrender-core';
import { Brush } from '../../src';
import { createCanvas } from '../util/dom';
import { createTestStage } from '../util/vrender';

describe('Brush stage detach behavior', () => {
  let stage: Stage;

  beforeEach(() => {
    createCanvas(document.body, 'brush-stage-detach');
    stage = createTestStage('brush-stage-detach');
  });

  afterEach(() => {
    stage.release();
  });

  test('removes stage-level brush listeners when detached from stage', () => {
    const removeSpy = jest.spyOn(stage, 'removeEventListener');
    const brush = new Brush({
      interactiveRange: { minX: 0, maxX: 100, minY: 0, maxY: 100 },
      delayTime: 0
    });

    stage.defaultLayer.add(brush as any);
    removeSpy.mockClear();
    stage.defaultLayer.removeChild(brush as any);

    expect(brush.stage).toBeNull();
    expect(removeSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('pointerupoutside', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('pointerup', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('pointerleave', expect.any(Function));
  });
});
