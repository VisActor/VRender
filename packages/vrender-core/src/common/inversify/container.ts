import { Generator } from '../generator';
import { Binding } from './binding';
import type { interfaces } from './interfaces';
import { BindingScopeEnum, BindingTypeEnum } from './literal_types';
import { Metadata } from './meta-data';
import { INJECT_TAG, MULTI_INJECT_TAG, NAMED_TAG } from './metadata_keys';
import { MetadataReader } from './metadata_reader';
import { BindingToSyntax } from './syntax/binding_to_syntax';

interface IChildRequest {
  injectIdentifier: any;
  metadata: interfaces.Metadata<unknown>[];
  bindings: Binding<unknown>[];
}

interface GetArgs<T> {
  avoidConstraints: boolean;
  isMultiInject: boolean;
  serviceIdentifier: interfaces.ServiceIdentifier<T>;
  key: string | symbol;
  value: any;
}

export class Container {
  id: number;
  readonly options: interfaces.ContainerOptions;
  private _bindingDictionary: Map<any, Binding<unknown>[]>;
  private _metadataReader: interfaces.MetadataReader;

  constructor(containerOptions?: interfaces.ContainerOptions) {
    const options = containerOptions || {};
    options.defaultScope = options.defaultScope || BindingScopeEnum.Transient;
    // console.log(this);
    this.options = options;
    this.id = Generator.GenAutoIncrementId();
    this._bindingDictionary = new Map();
    this._metadataReader = new MetadataReader();
  }

  load(module: interfaces.ContainerModule) {
    const getHelpers = this._getContainerModuleHelpersFactory();

    const containerModuleHelpers = getHelpers(module.id);

    module.registry(
      containerModuleHelpers.bindFunction as interfaces.Bind,
      containerModuleHelpers.unbindFunction,
      containerModuleHelpers.isboundFunction,
      containerModuleHelpers.rebindFunction as interfaces.Rebind
    );
  }

  get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
    const getArgs = this._getNotAllArgs(serviceIdentifier, false);

    return this._get<T>(getArgs) as T;
  }

  getAll<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T[] {
    const getArgs = this._getAllArgs(serviceIdentifier);

    return this._get<T>(getArgs) as T[];
  }

  getTagged<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, key: string | number | symbol, value: unknown): T {
    const getArgs = this._getNotAllArgs(serviceIdentifier, false, key, value);

    return this._get<T>(getArgs) as T;
  }

  getNamed<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, named: string | number | symbol): T {
    return this.getTagged<T>(serviceIdentifier, NAMED_TAG, named);
  }

  isBound(serviceIdentifier: interfaces.ServiceIdentifier<unknown>): boolean {
    return this._bindingDictionary.has(serviceIdentifier);
  }

  // Registers a type binding
  bind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T> {
    const scope = this.options.defaultScope;
    const binding = new Binding<T>(serviceIdentifier, scope);
    const list = this._bindingDictionary.get(serviceIdentifier) || [];
    list.push(binding);
    this._bindingDictionary.set(serviceIdentifier, list);
    return new BindingToSyntax<T>(binding);
  }

  unbind(serviceIdentifier: interfaces.ServiceIdentifier): void {
    this._bindingDictionary.delete(serviceIdentifier);
  }

  rebind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T> {
    this.unbind(serviceIdentifier);
    return this.bind(serviceIdentifier);
  }

  private _getContainerModuleHelpersFactory() {
    const setModuleId = (
      bindingToSyntax: interfaces.BindingToSyntax<unknown>,
      moduleId: interfaces.ContainerModuleBase['id']
    ) => {
      // TODO: Implement an internal type `_BindingToSyntax<T>` wherein this member
      // can be public. Let `BindingToSyntax<T>` be the presentational type that
      // depends on it, and does not expose this member as public.
      (
        bindingToSyntax as unknown as { _binding: { moduleId: interfaces.ContainerModuleBase['id'] } }
      )._binding.moduleId = moduleId;
    };

    const getBindFunction =
      <T>(moduleId: interfaces.ContainerModuleBase['id']) =>
      (serviceIdentifier: interfaces.ServiceIdentifier) => {
        const bindingToSyntax = this.bind(serviceIdentifier);
        setModuleId(bindingToSyntax, moduleId);
        return bindingToSyntax as BindingToSyntax<T>;
      };

    const getUnbindFunction = () => (serviceIdentifier: interfaces.ServiceIdentifier) => {
      return this.unbind(serviceIdentifier);
    };

    const getUnbindAsyncFunction = () => (serviceIdentifier: interfaces.ServiceIdentifier) => {
      return null as any;
      // return this.unbindAsync(serviceIdentifier);
    };

    const getIsboundFunction = () => (serviceIdentifier: interfaces.ServiceIdentifier) => {
      return this.isBound(serviceIdentifier);
    };

    const getRebindFunction =
      <T = unknown>(moduleId: interfaces.ContainerModuleBase['id']) =>
      (serviceIdentifier: interfaces.ServiceIdentifier) => {
        const bindingToSyntax = this.rebind(serviceIdentifier);
        setModuleId(bindingToSyntax, moduleId);
        return bindingToSyntax as BindingToSyntax<T>;
      };
    return (mId: interfaces.ContainerModuleBase['id']) => ({
      bindFunction: getBindFunction(mId),
      isboundFunction: getIsboundFunction(),
      rebindFunction: getRebindFunction(mId),
      unbindFunction: getUnbindFunction(),
      unbindAsyncFunction: getUnbindAsyncFunction()
    });
  }

  private _getNotAllArgs<T>(
    serviceIdentifier: interfaces.ServiceIdentifier<T>,
    isMultiInject: boolean,
    key?: string | number | symbol | undefined,
    value?: unknown
  ): any {
    return {
      avoidConstraints: false,
      isMultiInject,
      serviceIdentifier,
      key,
      value
    };
  }

  private _getAllArgs<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): any {
    return {
      avoidConstraints: true,
      isMultiInject: true,
      serviceIdentifier
    };
  }

  private _get<T>(getArgs: GetArgs<T>): T | T[] {
    const result: T[] = [];
    const bindings = this._bindingDictionary.get(getArgs.serviceIdentifier) as Binding<T>[];
    bindings.forEach(binding => {
      result.push(this._resolveFromBinding<T>(binding));
    });

    return !getArgs.isMultiInject && result.length === 1 ? result[0] : result;
  }

  private _getChildRequest(binding: Binding<unknown>) {
    const constr = binding.implementationType;
    const { userGeneratedMetadata } = this._metadataReader.getConstructorMetadata(constr as any);
    const keys = Object.keys(userGeneratedMetadata);
    const arr = [];
    for (let i = 0; i < keys.length; i++) {
      const constructorArgsMetadata = userGeneratedMetadata[i];
      const targetMetadataMap = {};
      constructorArgsMetadata.forEach(md => {
        targetMetadataMap[md.key] = md.value;
      });
      const metadata = {
        inject: targetMetadataMap[INJECT_TAG],
        multiInject: targetMetadataMap[MULTI_INJECT_TAG]
      };
      const injectIdentifier = metadata.inject || metadata.multiInject;
      const target = {
        serviceIdentifier: injectIdentifier,
        constructorArgsMetadata
      };
      const bindings = this._bindingDictionary.get(injectIdentifier).filter(b => {
        return b.constraint(target as any);
      });
      const request = {
        injectIdentifier,
        metadata: constructorArgsMetadata,
        bindings
      };

      arr.push(request);
    }

    return arr;
  }

  private _resolveFromBinding<T>(binding: Binding<T>): T {
    const result = this._getResolvedFromBinding<T>(binding);

    this._saveToScope(binding, result);

    return result;
  }

  private _getResolvedFromBinding<T>(binding: Binding<T>) {
    let result: T;
    switch (binding.type) {
      case BindingTypeEnum.ConstantValue:
      case BindingTypeEnum.Function:
        result = binding.cache as T;
        break;
      case BindingTypeEnum.Instance:
        result = this._resolveInstance<T>(binding, binding.implementationType as interfaces.Newable<T>);
        break;
      default:
        result = binding.dynamicValue({ container: this } as any);
    }

    return result;
  }

  private _resolveInstance<T>(binding: Binding<T>, constr: interfaces.Newable<T>): T {
    if (binding.activated) {
      return binding.cache;
    }

    const childRequests = this._getChildRequest(binding);
    return this._createInstance(constr, childRequests);
  }

  private _createInstance<T>(constr: interfaces.Newable<T>, childRequests: IChildRequest[]) {
    if (childRequests.length) {
      const resolved = this._resolveRequests(childRequests);
      const obj = new constr(...resolved);
      return obj;
    }
    const obj = new constr();
    return obj;
  }

  private _resolveRequests(childRequests: IChildRequest[]): any[] {
    return childRequests.map(request => {
      return request.bindings.length > 1
        ? request.bindings.map(binding => this._resolveFromBinding(binding))
        : this._resolveFromBinding(request.bindings[0]);
    });
  }

  private _saveToScope(binding: Binding<unknown>, result: any) {
    if (binding.scope === BindingScopeEnum.Singleton) {
      binding.cache = result;
      binding.activated = true;
    }
  }
}
