import type { interfaces } from './interfaces';

const BindingScopeEnum: interfaces.BindingScopeEnum = {
  Singleton: 'Singleton',
  Transient: 'Transient'
};

const BindingTypeEnum: interfaces.BindingTypeEnum = {
  ConstantValue: 'ConstantValue',
  Constructor: 'Constructor',
  DynamicValue: 'DynamicValue',
  Factory: 'Factory',
  Function: 'Function',
  Instance: 'Instance',
  Invalid: 'Invalid',
  Provider: 'Provider'
};

const TargetTypeEnum: interfaces.TargetTypeEnum = {
  ClassProperty: 'ClassProperty',
  ConstructorArgument: 'ConstructorArgument',
  Variable: 'Variable'
};

export { BindingScopeEnum, BindingTypeEnum, TargetTypeEnum };
