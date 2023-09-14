import * as METADATA_KEY from '../constants/metadata_keys';
import type { interfaces } from '../interfaces/interfaces';

class MetadataReader implements interfaces.MetadataReader {
  getConstructorMetadata(constructorFunc: NewableFunction): interfaces.ConstructorMetadata {
    // TypeScript compiler generated annotations
    const compilerGeneratedMetadata = (Reflect as any).getMetadata(METADATA_KEY.PARAM_TYPES, constructorFunc);

    // User generated constructor annotations
    const userGeneratedMetadata = (Reflect as any).getMetadata(METADATA_KEY.TAGGED, constructorFunc);

    return {
      compilerGeneratedMetadata,
      userGeneratedMetadata: userGeneratedMetadata || {}
    };
  }

  getPropertiesMetadata(constructorFunc: NewableFunction): interfaces.MetadataMap {
    // User generated properties annotations
    const userGeneratedMetadata = (Reflect as any).getMetadata(METADATA_KEY.TAGGED_PROP, constructorFunc) || [];
    return userGeneratedMetadata;
  }
}

export { MetadataReader };
