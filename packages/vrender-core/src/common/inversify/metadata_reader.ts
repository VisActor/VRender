import type { interfaces } from './interfaces';
import Reflect from '../Reflect-metadata';
import { PARAM_TYPES, TAGGED, TAGGED_PROP } from './metadata_keys';

class MetadataReader implements interfaces.MetadataReader {
  getConstructorMetadata(constructorFunc: NewableFunction): interfaces.ConstructorMetadata {
    // TypeScript compiler generated annotations
    const compilerGeneratedMetadata = (Reflect as any).getMetadata(PARAM_TYPES, constructorFunc);

    // User generated constructor annotations
    const userGeneratedMetadata = (Reflect as any).getMetadata(TAGGED, constructorFunc);

    return {
      compilerGeneratedMetadata,
      userGeneratedMetadata: userGeneratedMetadata || {}
    };
  }

  getPropertiesMetadata(constructorFunc: NewableFunction): interfaces.MetadataMap {
    // // User generated properties annotations
    // const userGeneratedMetadata = (Reflect as any).getMetadata(TAGGED_PROP, constructorFunc) || [];
    // return userGeneratedMetadata;
    throw new Error('暂未实现');
  }
}

export { MetadataReader };
