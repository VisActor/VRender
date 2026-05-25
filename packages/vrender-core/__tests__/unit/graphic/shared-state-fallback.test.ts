import { createRect } from '../../../src/graphic/rect';
import { createGroup } from '../../../src/graphic/group';
import { createSharedStateTestStage } from './shared-state-test-utils';

describe('shared state fallback', () => {
  test('should compile missing local states into the same adjudication pipeline', () => {
    const stage = createSharedStateTestStage();
    const group = createGroup({});
    const rect = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'base', stroke: 'black' });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    (group as any).sharedStateDefinitions = {
      hover: { fill: 'red' }
    };
    rect.states = {
      hover: { fill: 'local-hover' },
      selected: {
        name: 'selected',
        priority: 10,
        suppress: ['hover'],
        patch: { stroke: 'blue' }
      }
    };

    stage.appendChild(group);
    group.appendChild(rect);

    rect.useStates(['hover', 'selected'], false);

    expect(rect.currentStates).toEqual(['hover', 'selected']);
    expect(rect.effectiveStates).toEqual(['selected']);
    expect(rect.attribute.fill).toBe('base');
    expect(rect.attribute.stroke).toBe('blue');
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });

  test('should warn once when graphic states fallback fills missing shared definitions', () => {
    const stage = createSharedStateTestStage();
    const group = createGroup({});
    const rect = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'base', stroke: 'black' });
    const anotherRect = createRect({ x: 20, y: 0, width: 10, height: 10, fill: 'base', stroke: 'black' });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    (group as any).sharedStateDefinitions = {
      hover: { fill: 'red' }
    };
    rect.states = {
      pressed: { stroke: 'blue' }
    };
    anotherRect.states = {
      pressed: { stroke: 'green' }
    };

    stage.appendChild(group);
    group.appendChild(rect);
    group.appendChild(anotherRect);

    rect.useStates(['pressed'], false);
    rect.clearStates(false);
    rect.useStates(['pressed'], false);
    anotherRect.useStates(['pressed'], false);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('graphic.states fallback');

    warnSpy.mockRestore();
  });

  test('should not warn for shared definitions or local-only graphic states', () => {
    const stage = createSharedStateTestStage();
    const group = createGroup({});
    const sharedRect = createRect({ x: 0, y: 0, width: 10, height: 10, fill: 'base' });
    const localRect = createRect({ x: 20, y: 0, width: 10, height: 10, fill: 'base' });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    (group as any).sharedStateDefinitions = {
      hover: { fill: 'red' }
    };
    localRect.states = {
      selected: { fill: 'blue' }
    };

    stage.appendChild(group);
    group.appendChild(sharedRect);
    stage.appendChild(localRect);

    sharedRect.useStates(['hover'], false);
    localRect.useStates(['selected'], false);

    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
