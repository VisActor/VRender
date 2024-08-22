import type { Dict } from '@visactor/vutils';
import type { INode } from '../interface/node-tree';
import type { IEventTarget } from '../interface/event';

import { FederatedEvent, CustomEvent } from './federated-event';

/**
 * 代码参考自 https://github.com/pixijs/pixijs
 * The MIT License

  Copyright (c) 2013-2023 Mathew Groves, Chad Engler

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

export const EventTarget: Omit<IEventTarget, Exclude<keyof INode, 'dispatchEvent'>> = {
  // pickable: true,
  // visible: true,
  // attribute: {},

  /**
   * @override
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent
   * @param e
   * @returns
   */
  dispatchEvent<T extends FederatedEvent>(e: T): boolean {
    if (!(e instanceof FederatedEvent)) {
      throw new Error('DisplayObject cannot propagate events outside of the Federated Events API');
    }

    e.defaultPrevented = false;
    e.path = [];
    e.detailPath && (e.detailPath = []);
    e.target = this as IEventTarget;
    e?.manager?.dispatchEvent(e);

    return !e.defaultPrevented;
  },

  /**
   * @deprecated
   * @alias dispatchEvent
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  emit(eventName: string, object: Dict<any>) {
    return this.dispatchEvent(new CustomEvent(eventName, object));
  }
};
