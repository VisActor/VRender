import { Group, createGroup } from '../../../src/graphic/group';
import { createRect } from '../../../src/graphic/rect';
import { createSharedStateTestStage } from './shared-state-test-utils';

describe('shared state batch mount', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should defer default state synchronization for a detached subtree until it enters a stage', () => {
    const stage = createSharedStateTestStage();
    const stateScope = createGroup({});
    const item = createGroup({});
    const shape = createRect({ fill: 'black', opacity: 1, width: 1, height: 1 });

    (stateScope as any).sharedStateDefinitions = {
      selected: { fill: 'red', opacity: 0.5 }
    };
    shape.states = { selected: { fill: 'local-selected' } };
    shape.currentStates = ['selected'];
    item.appendChild(shape);

    const syncChildSharedStateTreeBinding = jest.spyOn(Group.prototype as any, 'syncChildSharedStateTreeBinding');
    stateScope.appendChild(item);

    expect(syncChildSharedStateTreeBinding).not.toHaveBeenCalled();

    stage.appendChild(stateScope);
    shape.refreshSharedStateBeforeRender();

    expect(shape.stage).toBe(stage);
    expect(shape.attribute.fill).toBe('red');
    expect(shape.attribute.opacity).toBe(0.5);
  });

  test('should preserve custom parent-tree synchronization hooks', () => {
    const stage = createSharedStateTestStage();
    const group = createGroup({});
    const inheritedHandler = group.onParentSharedStateTreeChanged;
    const customHandler = jest.fn((nextStage, nextLayer, nextScope) => {
      inheritedHandler.call(group, nextStage, nextLayer, nextScope);
    });
    group.onParentSharedStateTreeChanged = customHandler;

    stage.appendChild(group);

    expect(customHandler).toHaveBeenCalledTimes(1);
    expect(group.stage).toBe(stage);
  });

  test('should bind a detached multi-level subtree once while preserving inherited states and later tree edits', () => {
    const stage = createSharedStateTestStage();
    const stateScope = createGroup({});
    const itemsContainer = createGroup({});
    const stateDefinitions = {
      selected: { fill: 'red', opacity: 0.5 }
    };
    const itemGroups = [] as ReturnType<typeof createGroup>[];
    const itemShapes = [] as ReturnType<typeof createRect>[];

    (stateScope as any).sharedStateDefinitions = stateDefinitions;
    stateScope.appendChild(itemsContainer);

    for (let index = 0; index < 100; index++) {
      const itemGroup = createGroup({});
      const contentGroup = createGroup({});
      const shape = createRect({ x: index, y: 0, width: 1, height: 1, fill: 'black', opacity: 1 });

      shape.states = { selected: { fill: 'local-selected' } };
      itemGroup.currentStates = ['selected'];
      shape.currentStates = ['selected'];
      contentGroup.appendChild(shape);
      itemGroup.appendChild(contentGroup);
      itemsContainer.appendChild(itemGroup);
      itemGroups.push(itemGroup);
      itemShapes.push(shape);
    }

    const syncChildSharedStateTreeBinding = jest.spyOn(Group.prototype as any, 'syncChildSharedStateTreeBinding');
    const onParentSharedStateTreeChanged = jest.spyOn(Group.prototype, 'onParentSharedStateTreeChanged');

    stage.appendChild(stateScope);
    itemShapes[0].refreshSharedStateBeforeRender();

    expect(syncChildSharedStateTreeBinding).toHaveBeenCalledTimes(1);
    expect(onParentSharedStateTreeChanged).not.toHaveBeenCalled();
    expect((itemShapes[0] as any).boundSharedStateScope).toBe((stateScope as any).sharedStateScope);
    expect(itemShapes[0].attribute.fill).toBe('red');
    expect(itemShapes[0].attribute.opacity).toBe(0.5);

    (stateScope as any).sharedStateDefinitions = {
      selected: { fill: 'green', opacity: 0.75 }
    };
    itemShapes[0].refreshSharedStateBeforeRender();

    expect(itemShapes[0].attribute.fill).toBe('green');
    expect(itemShapes[0].attribute.opacity).toBe(0.75);

    const addedItem = createGroup({});
    const addedContent = createGroup({});
    const addedShape = createRect({ x: 101, y: 0, width: 1, height: 1, fill: 'black', opacity: 1 });
    addedShape.states = { selected: { fill: 'local-selected' } };
    addedItem.currentStates = ['selected'];
    addedShape.currentStates = ['selected'];
    addedContent.appendChild(addedShape);
    addedItem.appendChild(addedContent);

    itemsContainer.appendChild(addedItem);
    addedShape.refreshSharedStateBeforeRender();

    expect((addedShape as any).boundSharedStateScope).toBe((stateScope as any).sharedStateScope);
    expect(addedShape.attribute.fill).toBe('green');
    expect(addedShape.attribute.opacity).toBe(0.75);

    itemsContainer.removeChild(itemGroups[0]);

    expect(itemGroups[0].stage).toBeNull();
    expect(itemShapes[0].stage).toBeNull();
    expect((itemShapes[0] as any).boundSharedStateScope).toBeUndefined();
  });
});
