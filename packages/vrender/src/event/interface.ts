import type { INode } from '../interface/node-tree';
import type { Dict } from '@visactor/vutils';
import { IGraphicAttribute } from '../interface/graphic';

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

export interface IEventTarget extends INode {
  /** Whether this event target should fire UI events. */
  pickable: boolean;
  /** The parent of this event target. */
  parent: IEventTarget | null;
  /** Whether this event target should be visible. */
  visible: boolean;

  /** The children of this event target. */
  children?: IEventTarget[];

  /** Whether this event target has any children that need UI events. This can be used optimize event propagation. */
  childrenPickable?: boolean;

  attribute?: Partial<IGraphicAttribute>;

  emit: (eventName: any, data: Dict<any>) => boolean;

  getCursor: () => string;
  setCursor: (c?: string) => void;
}

export interface IRender {
  visualCanvas: {
    getCanvas: () => HTMLElement;
  };
  pickEvent: (position: [number, number], children: IEventTarget[], geoPick?: boolean) => IEventTarget | null;
  [key: string]: any;
}

// 事件系统扩展接口
export interface IEventExtension {
  /**
   * bind events
   */
  initEvents: () => void;
  /**
   * unbind events
   */
  removeEvents: () => void;
  /**
   * release
   */
  release: () => void;
}
