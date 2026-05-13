import { AABBBounds } from '@visactor/vutils';
import { UpdateTag } from '../../../src/common/enums';
import { createGroup } from '../../../src/graphic/group';
import { createRect } from '../../../src/graphic/rect';
import { DirtyBoundsPlugin } from '../../../src/plugins/builtin-plugin/dirty-bounds-plugin';
import { FlexLayoutPlugin } from '../../../src/plugins/builtin-plugin/flex-layout-plugin';
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

  test('should skip paint-only dirty hook during first full render', () => {
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
      renderCount: 0,
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
    expect(graphicServiceHooks.onAttributeUpdate.taps.some(item => item.name === (plugin as any).key)).toBe(false);
    expect(graphicServiceHooks.beforeUpdateAABBBounds.taps.some(item => item.name === (plugin as any).key)).toBe(false);
    expect(graphicServiceHooks.afterUpdateAABBBounds.taps.some(item => item.name === (plugin as any).key)).toBe(false);
    expect(graphicServiceHooks.clearAABBBounds.taps.some(item => item.name === (plugin as any).key)).toBe(false);
    expect(graphicServiceHooks.onRemove.taps.some(item => item.name === (plugin as any).key)).toBe(false);

    stage.renderCount = 1;
    stage.hooks.afterRender.call(stage as any);

    expect(graphicServiceHooks.onAttributeUpdate.taps.some(item => item.name === (plugin as any).key)).toBe(true);
    expect(graphicServiceHooks.beforeUpdateAABBBounds.taps.some(item => item.name === (plugin as any).key)).toBe(true);
    expect(graphicServiceHooks.afterUpdateAABBBounds.taps.some(item => item.name === (plugin as any).key)).toBe(true);
    expect(graphicServiceHooks.clearAABBBounds.taps.some(item => item.name === (plugin as any).key)).toBe(true);
    expect(graphicServiceHooks.onRemove.taps.some(item => item.name === (plugin as any).key)).toBe(true);
  });

  test('should reuse cached global bounds on remove without forcing bounds recomputation', () => {
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
    const cachedBounds = new AABBBounds();

    cachedBounds.setValue(0, 0, 10, 20);
    plugin.activate({ stage } as any);

    (graphic as any).stage = stage;
    (graphic as any)._globalAABBBounds = cachedBounds;
    (graphic as any)._updateTag = UpdateTag.UPDATE_BOUNDS;
    const recompute = jest.spyOn(graphic as any, 'tryUpdateGlobalAABBBounds');

    graphicServiceHooks.onRemove.call(graphic as any);

    expect(stage.dirty).toHaveBeenCalledWith(cachedBounds);
    expect(recompute).not.toHaveBeenCalled();
  });

  test('should not compute missing bounds on remove', () => {
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
    (graphic as any)._globalAABBBounds = undefined;
    const recompute = jest.spyOn(graphic as any, 'tryUpdateGlobalAABBBounds');

    graphicServiceHooks.onRemove.call(graphic as any);

    expect(stage.dirty).not.toHaveBeenCalled();
    expect(recompute).not.toHaveBeenCalled();
  });

  test('should not run flex layout when a graphic detaches from stage', () => {
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
      graphicService: {
        hooks: graphicServiceHooks
      }
    };
    const plugin = new FlexLayoutPlugin();
    const layout = jest.spyOn(plugin as any, 'tryLayout').mockImplementation(() => undefined);

    plugin.activate({ stage } as any);

    graphicServiceHooks.onSetStage.call(graphic as any, null);
    expect(layout).not.toHaveBeenCalled();

    graphicServiceHooks.onSetStage.call(graphic as any, stage);
    expect(layout).toHaveBeenCalledTimes(1);
  });

  test('should detach child in high-performance release mode without update hooks', () => {
    const parent = createGroup({});
    const child = createGraphic();
    const graphicService = {
      onAttributeUpdate: jest.fn(),
      onSetStage: jest.fn(),
      onRemove: jest.fn(),
      onRelease: jest.fn()
    };
    const stage = {
      graphicService
    };
    const updateParent = jest.spyOn(parent as any, 'addUpdateBoundTag');
    const detachChild = jest.spyOn(child as any, 'detachStageForRelease');

    parent.add(child);
    (parent as any).stage = stage;
    (child as any).stage = stage;

    parent.removeChild(child, true);

    expect(child.parent).toBeNull();
    expect((child as any).stage).toBeNull();
    expect(detachChild).toHaveBeenCalledTimes(1);
    expect(graphicService.onRemove).not.toHaveBeenCalled();
    expect(graphicService.onSetStage).not.toHaveBeenCalled();
    expect(updateParent).toHaveBeenCalledTimes(1);
  });

  test('should recursively clear release references in high-performance detach mode', () => {
    const parent = createGroup({});
    const childGroup = createGroup({});
    const grandChild = createGraphic();
    const scope = {
      subtreeActiveDescendants: new Set([grandChild])
    };
    const stage = {
      graphicService: {
        onAttributeUpdate: jest.fn(),
        onSetStage: jest.fn(),
        onRemove: jest.fn(),
        onRelease: jest.fn()
      }
    };
    const layer = {};

    parent.add(childGroup);
    childGroup.add(grandChild);
    (parent as any).stage = stage;
    (parent as any).layer = layer;
    (childGroup as any).stage = stage;
    (childGroup as any).layer = layer;
    (grandChild as any).stage = stage;
    (grandChild as any).layer = layer;
    (grandChild as any).registeredActiveScopes = new Set([scope]);
    (grandChild as any).mayHaveTrackedAnimates = () => true;
    const stopAnimates = jest.spyOn(grandChild as any, 'stopAnimates').mockImplementation(() => undefined);

    parent.removeChild(childGroup, true);

    expect(childGroup.parent).toBeNull();
    expect((childGroup as any).stage).toBeNull();
    expect((childGroup as any).layer).toBeNull();
    expect((grandChild as any).stage).toBeNull();
    expect((grandChild as any).layer).toBeNull();
    expect((grandChild as any).registeredActiveScopes).toBeUndefined();
    expect(scope.subtreeActiveDescendants.has(grandChild)).toBe(false);
    expect(stopAnimates).toHaveBeenCalledTimes(1);
    expect(stage.graphicService.onRemove).not.toHaveBeenCalled();
    expect(stage.graphicService.onSetStage).not.toHaveBeenCalled();

    childGroup.release(true);

    expect((childGroup as any).releaseStatus).toBe('released');
    expect((grandChild as any).releaseStatus).toBe('released');
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
