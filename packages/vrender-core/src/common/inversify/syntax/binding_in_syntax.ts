import type { interfaces } from '../interfaces';
import { BindingScopeEnum } from '../literal_types';
import { namedConstraint } from './constraint_helpers';

class BindingInSyntax<T> implements interfaces.BindingInSyntax<T> {
  private _binding: interfaces.Binding<T>;

  constructor(binding: interfaces.Binding<T>) {
    this._binding = binding;
  }

  inRequestScope(): interfaces.BindingInSyntax<T> {
    // this._binding.scope = BindingScopeEnum.Request;
    // return new BindingWhenOnSyntax<T>(this._binding);
    throw new Error('暂未实现');
  }

  inSingletonScope(): interfaces.BindingInSyntax<T> {
    this._binding.scope = BindingScopeEnum.Singleton;
    return this;
  }

  inTransientScope(): interfaces.BindingInSyntax<T> {
    this._binding.scope = BindingScopeEnum.Transient;
    return this;
  }

  whenTargetNamed(name: string | number | symbol): interfaces.BindingOnSyntax<T> {
    this._binding.constraint = namedConstraint(name);
    return this;
  }
}

export { BindingInSyntax };
