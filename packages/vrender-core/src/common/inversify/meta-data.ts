import { NAMED_TAG } from './metadata_keys';

export class Metadata {
  key: string | number | symbol;
  value: unknown;

  constructor(key: string | number | symbol, value: unknown) {
    this.key = key;
    this.value = value;
  }

  toString() {
    if (this.key === NAMED_TAG) {
      return `named: ${String(this.value).toString()} `;
    }
    return `tagged: { key:${this.key.toString()}, value: ${String(this.value)} }`;
  }
}
