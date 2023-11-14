import { Metadata } from '../meta-data';
import { TAGGED } from '../metadata_keys';
import Reflect from '../../Reflect-metadata';

function _tagParameterOrProperty(
  metadataKey: string,
  annotationTarget: NewableFunction,
  key: string | symbol,
  metadata: Metadata
) {
  const metadatas: Metadata[] = [metadata];

  let paramsOrPropertiesMetadata: Record<string | symbol, Metadata[] | undefined> = {};
  // read metadata if available
  if ((Reflect as any).hasOwnMetadata(metadataKey, annotationTarget)) {
    paramsOrPropertiesMetadata = (Reflect as any).getMetadata(metadataKey, annotationTarget);
  }

  let paramOrPropertyMetadata: Metadata[] | undefined = paramsOrPropertiesMetadata[key as string];

  if (paramOrPropertyMetadata === undefined) {
    paramOrPropertyMetadata = [];
  }

  // set metadata
  paramOrPropertyMetadata.push(...metadatas);
  paramsOrPropertiesMetadata[key] = paramOrPropertyMetadata;
  (Reflect as any).defineMetadata(metadataKey, paramsOrPropertiesMetadata, annotationTarget);
}

function tagParameter(
  annotationTarget: DecoratorTarget,
  parameterName: string | symbol | undefined,
  parameterIndex: number,
  metadata: Metadata
) {
  _tagParameterOrProperty(TAGGED, annotationTarget as ConstructorFunction, parameterIndex.toString(), metadata);
}

export function createTaggedDecorator(metadata: Metadata) {
  return <T>(target: DecoratorTarget, targetKey?: string | symbol, indexOrPropertyDescriptor?: number) => {
    tagParameter(target, targetKey, indexOrPropertyDescriptor, metadata);
  };
}

type Prototype<T> = {
  [Property in keyof T]: T[Property] extends NewableFunction ? T[Property] : T[Property] | undefined;
} & { constructor: NewableFunction };

interface ConstructorFunction<T = Record<string, unknown>> {
  new (...args: unknown[]): T;
  prototype: Prototype<T>;
}

export type DecoratorTarget<T = unknown> = ConstructorFunction<T> | Prototype<T>;

export function injectBase(metadataKey: string) {
  return <T = unknown>(serviceIdentifier: any) => {
    return (target: DecoratorTarget<T>, targetKey?: string | symbol, indexOrPropertyDescriptor?: number) => {
      return createTaggedDecorator(new Metadata(metadataKey, serviceIdentifier))(
        target,
        targetKey,
        indexOrPropertyDescriptor
      );
    };
  };
}
