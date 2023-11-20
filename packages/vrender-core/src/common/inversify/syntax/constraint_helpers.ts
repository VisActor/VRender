import type { interfaces } from '../interfaces';
import { Metadata } from '../meta-data';
import { NAMED_TAG } from '../metadata_keys';

const taggedConstraint = (key: string | number | symbol) => (value: unknown) => {
  const constraint: interfaces.ConstraintFunction = (request: any) => {
    if (request == null || request.constructorArgsMetadata == null) {
      return false;
    }
    const constructorArgsMetadata = request.constructorArgsMetadata;
    for (let i = 0; i < constructorArgsMetadata.length; i++) {
      if (constructorArgsMetadata[i].key === key && constructorArgsMetadata[i].value === value) {
        return true;
      }
    }
    return false;
  };
  // request !== null && request.target !== null && request.target.matchesTag(key)(value);

  constraint.metaData = new Metadata(key, value);

  return constraint;
};

export const namedConstraint = taggedConstraint(NAMED_TAG);
