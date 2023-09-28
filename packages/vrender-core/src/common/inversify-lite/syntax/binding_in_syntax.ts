import { BindingScopeEnum } from '../constants/literal_types';
import type { interfaces } from '../interfaces/interfaces';
import { BindingWhenOnSyntax } from './binding_when_on_syntax';

class BindingInSyntax<T> implements interfaces.BindingInSyntax<T> {
  private _binding: interfaces.Binding<T>;

  constructor(binding: interfaces.Binding<T>) {
    this._binding = binding;
  }

  inRequestScope(): interfaces.BindingWhenOnSyntax<T> {
    this._binding.scope = BindingScopeEnum.Request;
    return new BindingWhenOnSyntax<T>(this._binding);
  }

  inSingletonScope(): interfaces.BindingWhenOnSyntax<T> {
    this._binding.scope = BindingScopeEnum.Singleton;
    return new BindingWhenOnSyntax<T>(this._binding);
  }

  inTransientScope(): interfaces.BindingWhenOnSyntax<T> {
    this._binding.scope = BindingScopeEnum.Transient;
    return new BindingWhenOnSyntax<T>(this._binding);
  }
}

export { BindingInSyntax };
