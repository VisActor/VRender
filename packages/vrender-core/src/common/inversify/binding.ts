import { Generator } from '../generator';
import type { interfaces } from './interfaces';
import { BindingScopeEnum, BindingTypeEnum } from './literal_types';

class Binding<TActivated> implements interfaces.Binding<TActivated> {
  id: number;
  moduleId!: interfaces.ContainerModuleBase['id'];

  // Determines weather the bindings has been already activated
  // The activation action takes place when an instance is resolved
  // If the scope is singleton it only happens once
  activated: boolean;

  // A runtime identifier because at runtime we don't have interfaces
  serviceIdentifier: interfaces.ServiceIdentifier<TActivated>;

  // constructor from binding to or toConstructor
  implementationType: interfaces.Newable<TActivated> | TActivated | null;

  // Cache used to allow singleton scope and BindingType.ConstantValue bindings
  cache: TActivated | null;

  // Cache used to allow BindingType.DynamicValue bindings
  dynamicValue: interfaces.DynamicValue<TActivated> | null;

  // The scope mode to be used
  scope: interfaces.BindingScope;

  // The kind of binding
  type: interfaces.BindingType;

  // A factory method used in BindingType.Factory bindings
  factory: interfaces.FactoryCreator<unknown> | null;

  // An async factory method used in BindingType.Provider bindings
  provider: interfaces.ProviderCreator<unknown> | null;

  // A constraint used to limit the contexts in which this binding is applicable
  constraint: interfaces.ConstraintFunction;

  // // On activation handler (invoked just before an instance is added to cache and injected)
  // onActivation: interfaces.BindingActivation<TActivated> | null;

  // // On deactivation handler (invoked just before an instance is unbinded and removed from container)
  // onDeactivation: interfaces.BindingDeactivation<TActivated> | null;

  constructor(serviceIdentifier: interfaces.ServiceIdentifier<TActivated>, scope: interfaces.BindingScope) {
    this.id = Generator.GenAutoIncrementId();
    this.activated = false;
    this.serviceIdentifier = serviceIdentifier;
    this.scope = scope;
    this.type = BindingTypeEnum.Invalid;
    this.constraint = (request: interfaces.Request | null) => true;
    this.implementationType = null;
    this.cache = null;
    this.factory = null;
    this.provider = null;
    // this.onActivation = null;
    // this.onDeactivation = null;
    this.dynamicValue = null;
  }

  clone(): interfaces.Binding<TActivated> {
    const clone = new Binding(this.serviceIdentifier, this.scope);
    clone.activated = clone.scope === BindingScopeEnum.Singleton ? this.activated : false;
    clone.implementationType = this.implementationType;
    clone.dynamicValue = this.dynamicValue;
    clone.scope = this.scope;
    clone.type = this.type;
    // clone.factory = this.factory;
    clone.provider = this.provider;
    clone.constraint = this.constraint;
    // clone.onActivation = this.onActivation;
    // clone.onDeactivation = this.onDeactivation;
    clone.cache = this.cache;
    return clone;
  }
}

export { Binding };
