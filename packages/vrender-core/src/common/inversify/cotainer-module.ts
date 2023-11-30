import { Generator } from '../generator';
import type { interfaces } from '../inversify-lite';

export class ContainerModule {
  id: number;
  registry: interfaces.ContainerModuleCallBack;

  constructor(registry: interfaces.ContainerModuleCallBack) {
    this.id = Generator.GenAutoIncrementId();
    this.registry = registry;
  }
}
