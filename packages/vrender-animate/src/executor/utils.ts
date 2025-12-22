import { isFunction } from '@visactor/vutils';

export function getCustomType(custom: any): number {
  return custom && isFunction(custom) ? (/^class\s/.test(Function.prototype.toString.call(custom)) ? 1 : 2) : 0;
}
