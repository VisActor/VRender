import type React from 'react';
import { error } from './debug';

export function assertRef<T>(forwardedRef: any): asserts forwardedRef is React.MutableRefObject<T> {
  if (typeof forwardedRef === 'function') {
    error('Callback ref not support!');
  }
}
