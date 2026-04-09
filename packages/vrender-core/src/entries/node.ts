import { BrowserEntry } from './browser';
import type { IEntryOptions } from './types';

export class NodeEntry extends BrowserEntry {
  constructor(options: IEntryOptions = {}) {
    super(options);
  }
}

export function createNodeApp(options: IEntryOptions = {}) {
  return new NodeEntry(options);
}
