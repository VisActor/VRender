import { Metadata } from '../meta-data';
import { NAMED_TAG } from '../metadata_keys';
import { createTaggedDecorator } from './inject_base';

export function named(name: string | number | symbol) {
  return createTaggedDecorator(new Metadata(NAMED_TAG, name));
}
