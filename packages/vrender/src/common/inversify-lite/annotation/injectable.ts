import * as ERRORS_MSGS from '../constants/error_msgs';
import * as METADATA_KEY from '../constants/metadata_keys';

function injectable() {
  return function <T extends abstract new (...args: any) => unknown>(target: T) {
    if ((Reflect as any).hasOwnMetadata(METADATA_KEY.PARAM_TYPES, target)) {
      throw new Error(ERRORS_MSGS.DUPLICATED_INJECTABLE_DECORATOR);
    }

    const types = (Reflect as any).getMetadata(METADATA_KEY.DESIGN_PARAM_TYPES, target) || [];
    (Reflect as any).defineMetadata(METADATA_KEY.PARAM_TYPES, types, target);

    return target;
  };
}

export { injectable };
