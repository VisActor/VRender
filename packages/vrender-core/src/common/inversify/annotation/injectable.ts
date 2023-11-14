import * as METADATA_KEY from '../metadata_keys';
import Reflect from '../../Reflect-metadata';

export function injectable() {
  return function <T extends abstract new (...args: any) => unknown>(target: T) {
    (Reflect as any).defineMetadata(METADATA_KEY.PARAM_TYPES, null, target);

    return target;
  };
}
