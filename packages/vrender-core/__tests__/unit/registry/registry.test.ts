import type { IGraphicPicker } from '../../../src/interface/picker';
import type { IGraphicRender } from '../../../src/interface/render';
import type { IPlugin } from '../../../src/plugins/types';
import { ContributionRegistry, PickerRegistry, PluginRegistry, RendererRegistry } from '../../../src/registry';

function createRenderer(type: string): IGraphicRender {
  return {
    type,
    numberType: 1,
    draw: jest.fn(),
    reInit: jest.fn()
  };
}

function createPicker(type: string): IGraphicPicker {
  return {
    type,
    numberType: 1,
    contains: jest.fn()
  };
}

function createPlugin(name: string): IPlugin {
  return {
    name,
    version: 'test',
    install: jest.fn(),
    uninstall: jest.fn()
  };
}

describe('registry module', () => {
  test('RendererRegistry should support symbol keys and cache factory instances', () => {
    const registry = new RendererRegistry();
    const key = Symbol('rect-renderer');
    const factory = jest.fn(() => createRenderer('rect'));

    registry.register(key, factory);

    const first = registry.get(key);
    const second = registry.get(key);

    expect(first).toBeDefined();
    expect(second).toBe(first);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  test('RendererRegistry should support batch registration and getAll', () => {
    const registry = new RendererRegistry();
    const firstKey = Symbol('first');
    const secondKey = Symbol('second');

    registry.registerMany([
      [firstKey, createRenderer('rect')],
      [secondKey, () => createRenderer('circle')]
    ]);

    expect(registry.get(firstKey)?.type).toBe('rect');
    expect(registry.get(secondKey)?.type).toBe('circle');
    expect(registry.getAll()).toHaveLength(2);
  });

  test('PickerRegistry should register and lookup pickers by key', () => {
    const registry = new PickerRegistry();
    const key = Symbol('rect-picker');
    const picker = createPicker('rect');

    registry.register(key, picker);

    expect(registry.get(key)).toBe(picker);
    expect(registry.getAll()).toEqual([picker]);
  });

  test('PluginRegistry should install, replace and uninstall plugins by name', () => {
    const registry = new PluginRegistry();
    const first = createPlugin('browser-env');
    const second = createPlugin('browser-env');

    registry.install(first);
    registry.install(second);

    expect(registry.get('browser-env')).toBe(second);
    expect(registry.getAll()).toEqual([second]);

    registry.uninstall('browser-env');
    expect(registry.get('browser-env')).toBeUndefined();
  });

  test('ContributionRegistry should collect multiple contributions under one key', () => {
    const registry = new ContributionRegistry<string>();
    const key = Symbol('draw-contribution');

    registry.register(key, 'before');
    registry.register(key, 'after');

    expect(registry.get(key)).toEqual(['before', 'after']);
    expect(registry.getAll()).toEqual(['before', 'after']);
  });

  test('registry instances should remain isolated', () => {
    const firstRegistry = new RendererRegistry();
    const secondRegistry = new RendererRegistry();
    const key = Symbol('isolated');

    firstRegistry.register(key, createRenderer('rect'));

    expect(firstRegistry.get(key)?.type).toBe('rect');
    expect(secondRegistry.get(key)).toBeUndefined();
  });
});
