import { ON_DEACTIVATION_ERROR, POST_CONSTRUCT_ERROR, PRE_DESTROY_ERROR } from '../constants/error_msgs';
import { BindingScopeEnum, TargetTypeEnum } from '../constants/literal_types';
import * as METADATA_KEY from '../constants/metadata_keys';
import type { interfaces } from '../interfaces/interfaces';
import type { Metadata } from '../planning/metadata';
import { isPromise, isPromiseOrContainsPromise } from '../utils/async';
import Reflect from '../../Reflect-metadata';

interface InstanceCreationInstruction {
  constructorInjections: unknown[];
  propertyInjections: unknown[];
  propertyRequests: interfaces.Request[];
}

interface ResolvedRequests extends InstanceCreationInstruction {
  isAsync: boolean;
}

interface CreateInstanceWithInjectionArg<T> extends InstanceCreationInstruction {
  constr: interfaces.Newable<T>;
}

function _resolveRequests(
  childRequests: interfaces.Request[],
  resolveRequest: interfaces.ResolveRequestHandler
): ResolvedRequests {
  return childRequests.reduce<ResolvedRequests>(
    (resolvedRequests, childRequest) => {
      const injection = resolveRequest(childRequest);
      const targetType = childRequest.target.type;
      if (targetType === TargetTypeEnum.ConstructorArgument) {
        resolvedRequests.constructorInjections.push(injection);
      } else {
        resolvedRequests.propertyRequests.push(childRequest);
        resolvedRequests.propertyInjections.push(injection);
      }
      if (!resolvedRequests.isAsync) {
        resolvedRequests.isAsync = isPromiseOrContainsPromise(injection);
      }
      return resolvedRequests;
    },
    { constructorInjections: [], propertyInjections: [], propertyRequests: [], isAsync: false }
  );
}

function _createInstance<T>(
  constr: interfaces.Newable<T>,
  childRequests: interfaces.Request[],
  resolveRequest: interfaces.ResolveRequestHandler
): T | Promise<T> {
  let result: T | Promise<T>;

  if (childRequests.length > 0) {
    const resolved = _resolveRequests(childRequests, resolveRequest);
    const createInstanceWithInjectionsArg: CreateInstanceWithInjectionArg<T> = { ...resolved, constr };
    if (resolved.isAsync) {
      result = createInstanceWithInjectionsAsync(createInstanceWithInjectionsArg);
    } else {
      result = createInstanceWithInjections(createInstanceWithInjectionsArg);
    }
  } else {
    if (!(window as any).constr) {
      (window as any).constr = 0;
      (window as any).map = new Map();
    }
    const t = performance.now();
    result = new constr();
    const delta = performance.now() - t;
    (window as any).map.set(result, delta);
    (window as any).constr += delta;
  }

  return result;
}

function createInstanceWithInjections<T>(args: CreateInstanceWithInjectionArg<T>): T {
  if (!(window as any).constr) {
    (window as any).constr = 0;
    (window as any).map = new Map();
  }
  const t = performance.now();
  const instance = new args.constr(...args.constructorInjections);
  const delta = performance.now() - t;
  (window as any).map.set(instance, delta);
  (window as any).constr += delta;
  args.propertyRequests.forEach((r: interfaces.Request, index: number) => {
    const property = r.target.identifier;
    const injection = args.propertyInjections[index];
    (instance as Record<string | symbol, unknown>)[property] = injection;
  });
  return instance;
}

async function createInstanceWithInjectionsAsync<T>(args: CreateInstanceWithInjectionArg<T>): Promise<T> {
  const constructorInjections = await possiblyWaitInjections(args.constructorInjections);
  const propertyInjections = await possiblyWaitInjections(args.propertyInjections);
  return createInstanceWithInjections<T>({ ...args, constructorInjections, propertyInjections });
}

async function possiblyWaitInjections(possiblePromiseinjections: unknown[]) {
  const injections: unknown[] = [];
  for (const injection of possiblePromiseinjections) {
    if (Array.isArray(injection)) {
      injections.push(Promise.all(injection));
    } else {
      injections.push(injection);
    }
  }
  return Promise.all(injections);
}

function _getInstanceAfterPostConstruct<T>(constr: interfaces.Newable<T>, result: T): T | Promise<T> {
  const postConstructResult = _postConstruct(constr, result);

  if (isPromise(postConstructResult)) {
    return postConstructResult.then(() => result);
  }
  return result;
}

function _postConstruct<T>(constr: interfaces.Newable<T>, instance: T): void | Promise<void> {
  if ((Reflect as any).hasMetadata(METADATA_KEY.POST_CONSTRUCT, constr)) {
    const data: Metadata = (Reflect as any).getMetadata(METADATA_KEY.POST_CONSTRUCT, constr);
    return (instance as interfaces.Instance<T>)[data.value as string]?.();
    // try {
    //   return (instance as interfaces.Instance<T>)[data.value as string]?.();
    // } catch (e) {
    //   if (e instanceof Error) {
    //     throw new Error(POST_CONSTRUCT_ERROR(constr.name, e.message));
    //   }
    // }
  }
}

function _validateInstanceResolution<T = unknown>(binding: interfaces.Binding<T>, constr: interfaces.Newable<T>): void {
  if (binding.scope !== BindingScopeEnum.Singleton) {
    _throwIfHandlingDeactivation(binding, constr);
  }
}

function _throwIfHandlingDeactivation<T = unknown>(
  binding: interfaces.Binding<T>,
  constr: interfaces.Newable<T>
): void {
  const scopeErrorMessage = `Class cannot be instantiated in ${
    binding.scope === BindingScopeEnum.Request ? 'request' : 'transient'
  } scope.`;
  if (typeof binding.onDeactivation === 'function') {
    throw new Error(ON_DEACTIVATION_ERROR(constr.name, scopeErrorMessage));
  }

  if ((Reflect as any).hasMetadata(METADATA_KEY.PRE_DESTROY, constr)) {
    throw new Error(PRE_DESTROY_ERROR(constr.name, scopeErrorMessage));
  }
}

function resolveInstance<T>(
  binding: interfaces.Binding<T>,
  constr: interfaces.Newable<T>,
  childRequests: interfaces.Request[],
  resolveRequest: interfaces.ResolveRequestHandler
): T | Promise<T> {
  _validateInstanceResolution(binding, constr);

  const result = _createInstance(constr, childRequests, resolveRequest);

  if (isPromise(result)) {
    return result.then(resolvedResult => _getInstanceAfterPostConstruct(constr, resolvedResult));
  }
  return _getInstanceAfterPostConstruct(constr, result);
}

export { resolveInstance };
