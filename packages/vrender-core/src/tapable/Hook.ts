import type { AsArray, FullTap, IfSet, Tap, UnsetAdditionalOptions } from '../interface';

/**
 * 参考 https://github.com/webpack/tapable
 * The MIT License

  Copyright JS Foundation and other contributors

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
 */
export abstract class Hook<T, R, AdditionalOptions = UnsetAdditionalOptions> {
  private _args: string[];
  readonly name?: string;
  taps: FullTap[];

  constructor(args: string[], name?: string) {
    this._args = args;
    this.name = name;
    this.taps = [];
    // this.interceptors = [];
    // this._call = CALL_DELEGATE;
    // this.call = CALL_DELEGATE;
    // this._callAsync = CALL_ASYNC_DELEGATE;
    // this.callAsync = CALL_ASYNC_DELEGATE;
    // this._promise = PROMISE_DELEGATE;
    // this.promise = PROMISE_DELEGATE;
    // this._x = undefined;

    // this.tapAsync = this.tapAsync;
    // this.tapPromise = this.tapPromise;
  }

  // abstract compile(options: ICompileOptions): void;

  tap(options: string | (Tap & IfSet<AdditionalOptions>), fn: (...args: AsArray<T>) => R): void {
    this._tap('sync', options, fn);
  }

  unTap(options: string | (Tap & IfSet<AdditionalOptions>), fn?: (...args: AsArray<T>) => R): void {
    const name = typeof options === 'string' ? options.trim() : options.name;

    if (name) {
      this.taps = this.taps.filter(tap => !(tap.name === name && (!fn || tap.fn === fn)));
    }
  }

  private _parseOptions(
    type: string,
    options: string | (Tap & IfSet<AdditionalOptions>),
    fn: (...args: AsArray<T>) => R
  ) {
    let _options: FullTap;
    if (typeof options === 'string') {
      _options = {
        name: options.trim()
      } as any;
    } else if (typeof options !== 'object' || options === null) {
      throw new Error('Invalid tap options');
    }
    if (typeof _options.name !== 'string' || _options.name === '') {
      throw new Error('Missing name for tap');
    }
    _options = Object.assign({ type, fn }, _options);

    return _options;
  }

  private _tap(type: string, options: string | (Tap & IfSet<AdditionalOptions>), fn: (...args: AsArray<T>) => R) {
    this._insert(this._parseOptions(type, options, fn));
  }

  private _insert(item: FullTap) {
    let before;
    if (typeof item.before === 'string') {
      before = new Set([item.before]);
    } else if (Array.isArray(item.before)) {
      before = new Set(item.before);
    }
    let stage = 0;
    if (typeof item.stage === 'number') {
      stage = item.stage;
    }
    let i = this.taps.length;
    while (i > 0) {
      i--;
      const x = this.taps[i];
      this.taps[i + 1] = x;
      const xStage = x.stage || 0;
      if (before) {
        if (before.has(x.name)) {
          before.delete(x.name);
          continue;
        }
        if (before.size > 0) {
          continue;
        }
      }
      if (xStage > stage) {
        continue;
      }
      i++;
      break;
    }
    this.taps[i] = item;
  }
}
