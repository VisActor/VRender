import type { interfaces } from '../interfaces/interfaces';

export type ServiceIdentifierOrFunc<T> = interfaces.ServiceIdentifier<T> | LazyServiceIdentifer<T>;

export class LazyServiceIdentifer<T = unknown> {
  private _cb: () => interfaces.ServiceIdentifier<T>;
  constructor(cb: () => interfaces.ServiceIdentifier<T>) {
    this._cb = cb;
  }

  unwrap() {
    return this._cb();
  }
}
