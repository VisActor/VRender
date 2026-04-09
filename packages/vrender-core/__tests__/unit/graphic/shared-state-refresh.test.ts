import { createRect } from '../../../src/graphic/rect';
import { createGroup } from '../../../src/graphic/group';
import { createSharedStateTestStage } from './shared-state-test-utils';

describe('shared state refresh contract', () => {
  test('should refresh active descendants before next render when group shared definitions change', () => {
    const stage = createSharedStateTestStage();
    const outer = createGroup({});
    const inner = createGroup({});
    const rect = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'black' });

    (outer as any).sharedStateDefinitions = {
      hover: { fill: 'red' }
    };

    stage.appendChild(outer);
    outer.appendChild(inner);
    inner.appendChild(rect);

    rect.useStates(['hover'], false);
    expect(rect.attribute.fill).toBe('red');

    (outer as any).sharedStateDefinitions = {
      hover: { fill: 'green' }
    };

    expect((rect as any).sharedStateDirty).toBe(true);
    stage.hooks.beforeRender.call(stage);

    expect((rect as any).sharedStateDirty).toBe(false);
    expect(rect.attribute.fill).toBe('green');
  });

  test('should schedule next-frame render when shared definitions change', () => {
    const stage = createSharedStateTestStage();
    const outer = createGroup({});
    const rect = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'black' });
    const renderNextFrameSpy = jest.spyOn(stage, 'renderNextFrame');

    stage.appendChild(outer);
    outer.appendChild(rect);

    (outer as any).sharedStateDefinitions = {
      hover: { fill: 'red' }
    };
    rect.useStates(['hover'], false);
    renderNextFrameSpy.mockClear();

    (outer as any).sharedStateDefinitions = {
      hover: { fill: 'green' }
    };

    expect(renderNextFrameSpy).toHaveBeenCalledTimes(1);
    expect(stage.getScheduledFrameCount()).toBe(1);
    expect((rect as any).sharedStateDirty).toBe(true);
  });
});
