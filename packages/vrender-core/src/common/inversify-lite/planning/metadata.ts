import * as METADATA_KEY from '../constants/metadata_keys';
import type { interfaces } from '../interfaces/interfaces';

class Metadata implements interfaces.Metadata {
  key: string | number | symbol;
  value: unknown;

  constructor(key: string | number | symbol, value: unknown) {
    this.key = key;
    this.value = value;
  }

  toString() {
    if (this.key === METADATA_KEY.NAMED_TAG) {
      return `named: ${String(this.value).toString()} `;
    }
    return `tagged: { key:${this.key.toString()}, value: ${String(this.value)} }`;
  }
}

export { Metadata };
