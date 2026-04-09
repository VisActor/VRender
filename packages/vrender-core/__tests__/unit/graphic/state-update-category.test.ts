import { AABBBounds } from '@visactor/vutils';
import { UpdateTag } from '../../../src/common/enums';
import { createRect } from '../../../src/graphic/rect';
import { DirtyBoundsPlugin } from '../../../src/plugins/builtin-plugin/dirty-bounds-plugin';
import { SyncHook } from '../../../src/tapable';

describe('Graphic state update categories', () => {
  const createGraphic = () => {
    const graphic = createRect({
      x: 0,
      y: 0,
      width: 10,
      height: 20,
      fill: 'blue',
      stroke: 'black',
      lineWidth: 1,
      opacity: 1
    });

    jest.spyOn(graphic as any, 'getGraphicService').mockReturnValue({
      onAttributeUpdate: jest.fn(),
      onSetStage: jest.fn()
    });

    (graphic as any)._updateTag = UpdateTag.NONE;

    return graphic;
  };

  test('should mark fill-only state changes as paint-only without upgrading to bounds updates', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;

    graphic.useStates(['hover'], false);

    expect(graphic.attribute.fill).toBe('red');
    expect(graphic.shouldUpdateAABBBounds()).toBe(false);
    expect(((graphic as any)._updateTag & UpdateTag.UPDATE_PAINT) === UpdateTag.UPDATE_PAINT).toBe(true);
  });

  test('should dirty cached global bounds for paint-only updates without upgrading to bounds', () => {
    const graphic = createGraphic();
    const graphicServiceHooks = {
      onAttributeUpdate: new SyncHook<[any]>(['graphic']),
      onSetStage: new SyncHook<[any, any]>(['graphic', 'stage']),
      onRemove: new SyncHook<[any]>(['graphic']),
      onRelease: new SyncHook<[any]>(['graphic']),
      onAddIncremental: new SyncHook<[any, any, any]>(['graphic', 'group', 'stage']),
      onClearIncremental: new SyncHook<[any, any]>(['graphic', 'stage']),
      beforeUpdateAABBBounds: new SyncHook<[any, any, boolean, any]>(['graphic', 'stage', 'willUpdate', 'aabbBounds']),
      afterUpdateAABBBounds: new SyncHook<[any, any, any, any, boolean]>([
        'graphic',
        'stage',
        'aabbBounds',
        'globalAABBBounds',
        'selfChange'
      ]),
      clearAABBBounds: new SyncHook<[any, any, any]>(['graphic', 'stage', 'aabbBounds'])
    };
    const stage = {
      renderCount: 1,
      graphicService: {
        hooks: graphicServiceHooks
      },
      hooks: {
        afterRender: new SyncHook<[any]>(['stage'])
      },
      dirtyBounds: {
        clear: jest.fn()
      },
      dirty: jest.fn()
    };
    const plugin = new DirtyBoundsPlugin();

    plugin.activate({ stage } as any);

    (graphic as any).stage = stage;
    (graphic as any)._AABBBounds = new AABBBounds();
    (graphic as any)._AABBBounds.setValue(0, 0, 10, 20);
    (graphic as any)._globalAABBBounds = new AABBBounds();
    (graphic as any)._globalAABBBounds.setValue(0, 0, 10, 20);
    (graphic as any)._updateTag = UpdateTag.UPDATE_PAINT;

    graphicServiceHooks.onAttributeUpdate.call(graphic as any);

    expect(stage.dirty).toHaveBeenCalledWith((graphic as any)._globalAABBBounds);
    expect(graphic.shouldUpdateAABBBounds()).toBe(false);
  });

  test('should piggyback pick-affecting deltas onto bounds updates in Phase 2', () => {
    const graphic = createGraphic();
    graphic.states = {
      hidden: {
        visible: false
      }
    } as any;

    graphic.useStates(['hidden'], false);

    expect(graphic.attribute.visible).toBe(false);
    expect(((graphic as any)._updateTag & UpdateTag.UPDATE_BOUNDS) === UpdateTag.UPDATE_BOUNDS).toBe(true);
  });
});
