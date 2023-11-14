import type { interfaces } from '../interfaces/interfaces';
import { id } from '../utils/id';

export class ContainerModule implements interfaces.ContainerModule {
  id: number;
  registry: interfaces.ContainerModuleCallBack;

  constructor(registry: interfaces.ContainerModuleCallBack) {
    this.id = id();
    this.registry = registry;
  }
}
