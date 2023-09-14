import type { interfaces } from '../interfaces/interfaces';

class Plan implements interfaces.Plan {
  parentContext: interfaces.Context;
  rootRequest: interfaces.Request;

  constructor(parentContext: interfaces.Context, rootRequest: interfaces.Request) {
    this.parentContext = parentContext;
    this.rootRequest = rootRequest;
  }
}

export { Plan };
