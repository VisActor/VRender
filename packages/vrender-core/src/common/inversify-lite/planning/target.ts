import * as METADATA_KEY from '../constants/metadata_keys';
import type { interfaces } from '../interfaces/interfaces';
import { id } from '../utils/id';
import { getSymbolDescription } from '../utils/serialization';
import { Metadata } from './metadata';
import { QueryableString } from './queryable_string';

class Target implements interfaces.Target {
  id: number;
  type: interfaces.TargetType;
  serviceIdentifier: interfaces.ServiceIdentifier;
  name: interfaces.QueryableString;
  identifier: string | symbol;
  key!: string | symbol;
  metadata!: Metadata[];

  constructor(
    type: interfaces.TargetType,
    identifier: string | symbol,
    serviceIdentifier: interfaces.ServiceIdentifier,
    namedOrTagged?: string | Metadata
  ) {
    this.id = id();
    this.type = type;
    this.serviceIdentifier = serviceIdentifier;
    const queryableName = typeof identifier === 'symbol' ? getSymbolDescription(identifier) : identifier;
    this.name = new QueryableString(queryableName || '');
    this.identifier = identifier;
    this.metadata = [];

    let metadataItem: interfaces.Metadata | null = null;

    // is named target
    if (typeof namedOrTagged === 'string') {
      metadataItem = new Metadata(METADATA_KEY.NAMED_TAG, namedOrTagged);
    } else if (namedOrTagged instanceof Metadata) {
      // is target with metadata
      metadataItem = namedOrTagged;
    }

    // target has metadata
    if (metadataItem !== null) {
      this.metadata.push(metadataItem);
    }
  }

  hasTag(key: string): boolean {
    for (const m of this.metadata) {
      if (m.key === key) {
        return true;
      }
    }
    return false;
  }

  isArray(): boolean {
    return this.hasTag(METADATA_KEY.MULTI_INJECT_TAG);
  }

  matchesArray(name: interfaces.ServiceIdentifier<unknown>): boolean {
    return this.matchesTag(METADATA_KEY.MULTI_INJECT_TAG)(name);
  }

  isNamed(): boolean {
    return this.hasTag(METADATA_KEY.NAMED_TAG);
  }

  isTagged(): boolean {
    return this.metadata.some(metadata => METADATA_KEY.NON_CUSTOM_TAG_KEYS.every(key => metadata.key !== key));
  }

  isOptional(): boolean {
    return this.matchesTag(METADATA_KEY.OPTIONAL_TAG)(true);
  }

  getNamedTag(): interfaces.Metadata<string> | null {
    if (this.isNamed()) {
      return this.metadata.filter(m => m.key === METADATA_KEY.NAMED_TAG)[0] as interfaces.Metadata<string>;
    }
    return null;
  }

  getCustomTags(): interfaces.Metadata[] | null {
    if (this.isTagged()) {
      return this.metadata.filter(metadata => METADATA_KEY.NON_CUSTOM_TAG_KEYS.every(key => metadata.key !== key));
    }
    return null;
  }

  matchesNamedTag(name: string): boolean {
    return this.matchesTag(METADATA_KEY.NAMED_TAG)(name);
  }

  matchesTag(key: string) {
    return (value: unknown) => {
      for (const m of this.metadata) {
        if (m.key === key && m.value === value) {
          return true;
        }
      }
      return false;
    };
  }
}

export { Target };
