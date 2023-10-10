import type { interfaces } from '../interfaces/interfaces';
import { id } from '../utils/id';

class Context implements interfaces.Context {
  id: number;
  container: interfaces.Container;
  plan!: interfaces.Plan;
  currentRequest!: interfaces.Request;

  constructor(container: interfaces.Container) {
    this.id = id();
    this.container = container;
  }

  addPlan(plan: interfaces.Plan) {
    this.plan = plan;
  }

  setCurrentRequest(currentRequest: interfaces.Request) {
    this.currentRequest = currentRequest;
  }
}

export { Context };
