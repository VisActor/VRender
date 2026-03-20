import { ContainerModule, AsyncContainerModule } from '../../../../src/common/inversify-lite/container/container_module';

describe('inversify-lite ContainerModule', () => {
  test('ContainerModule stores registry and has id', () => {
    const registry = jest.fn();
    const module = new ContainerModule(registry as any);

    expect(typeof module.id).toBe('number');
    expect(module.registry).toBe(registry);
  });

  test('AsyncContainerModule stores registry and has id', () => {
    const registry = jest.fn();
    const module = new AsyncContainerModule(registry as any);

    expect(typeof module.id).toBe('number');
    expect(module.registry).toBe(registry);
  });
});
