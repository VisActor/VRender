import { BrowserEntry } from './browser';
import type { IEntryOptions } from './types';

export class NodeEntry extends BrowserEntry {}

export function createNodeApp(options: IEntryOptions = {}) {
  return new NodeEntry(options);
}
