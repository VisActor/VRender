import { BrowserEntry } from './browser';
import type { IEntryOptions } from './types';

export class MiniappEntry extends BrowserEntry {}

export function createMiniappApp(options: IEntryOptions = {}) {
  return new MiniappEntry(options);
}
