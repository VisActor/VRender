import type { interfaces } from '../interfaces';
import { BindingScopeEnum, BindingTypeEnum } from '../literal_types';
import { BindingInSyntax } from './binding_in_syntax';

class BindingToSyntax<T> implements interfaces.BindingToSyntax<T> {
  // TODO: Implement an internal type `_BindingToSyntax<T>` wherein this member
  // can be public. Let `BindingToSyntax<T>` be the presentational type that
  // depends on it, and does not expose this member as public.
  private _binding: interfaces.Binding<T>;

  constructor(binding: interfaces.Binding<T>) {
    this._binding = binding;
  }

  to(constructor: interfaces.Newable<T>): interfaces.BindingInWhenOnSyntax<T> {
    this._binding.type = BindingTypeEnum.Instance;
    this._binding.implementationType = constructor;
    return new BindingInSyntax<T>(this._binding);
  }

  toSelf(): interfaces.BindingInWhenOnSyntax<T> {
    const self = this._binding.serviceIdentifier;
    return this.to(self as any);
  }

  toDynamicValue(func: interfaces.DynamicValue<T>): interfaces.BindingInWhenOnSyntax<T> {
    this._binding.type = BindingTypeEnum.DynamicValue;
    this._binding.cache = null;
    this._binding.dynamicValue = func;
    this._binding.implementationType = null;
    return new BindingInSyntax<T>(this._binding);
  }

  toConstantValue(value: T): interfaces.BindingInSyntax<T> {
    this._binding.type = BindingTypeEnum.ConstantValue;
    this._binding.cache = value;
    this._binding.dynamicValue = null;
    this._binding.implementationType = null;
    this._binding.scope = BindingScopeEnum.Singleton;
    return new BindingInSyntax<T>(this._binding);
  }

  toFactory<T2>(factory: interfaces.FactoryCreator<T2>): interfaces.BindingInWhenOnSyntax<T> {
    this._binding.type = BindingTypeEnum.Factory;
    this._binding.factory = factory;
    this._binding.scope = BindingScopeEnum.Singleton;
    return new BindingInSyntax<T>(this._binding);
  }

  toService(service: string | symbol | interfaces.Newable<T> | interfaces.Abstract<T>): void {
    this.toDynamicValue(context => context.container.get<T>(service));
  }
}

export { BindingToSyntax };
