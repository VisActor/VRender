import { isFunction } from '@visactor/vutils';
import type { IPickEventParams } from '../../interface';
import type { EventPoint, IEventTarget } from '../../interface/event';
import type { EventManager } from '../event-manager';

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

/**
 * An DOM-compatible synthetic event implementation that is "forwarded" on behalf of an original
 * FederatedEvent or native {@link https://dom.spec.whatwg.org/#event Event}.
 */
export class FederatedEvent<N extends Event = Event> implements Event {
  /** Flags whether this event bubbles. This will take effect only if it is set before propagation. */
  bubbles = true;

  cancelBubble = true;

  declare pickParams?: IPickEventParams;

  /**
   * Flags whether this event can be canceled using `FederatedEvent.preventDefault`. This is always
   * false (for now).
   */
  readonly cancelable = false;

  /**
   * Flag added for compatibility with DOM Event. It is not used in the Federated Events
   * API.
   * @see https://dom.spec.whatwg.org/#dom-event-composed
   */
  readonly composed = false;

  /** The listeners of the event target that are being notified. */
  currentTarget: IEventTarget | null;

  /** Flags whether the default response of the user agent was prevent through this event. */
  defaultPrevented = false;

  /**
   * The propagation phase.
   */
  eventPhase = FederatedEvent.prototype.NONE;

  /** Flags whether this is a user-trusted event */
  isTrusted: boolean;

  returnValue: boolean;
  srcElement: IEventTarget;

  /** The event target that this will be dispatched to. */
  target: IEventTarget | null;

  /** The timestamp of when the event was created. */
  timeStamp: number;

  /** The type of event, e.g. `pointerup`, `mousedown`. */
  type: string;

  /** The native event that caused the foremost original event. */
  nativeEvent: N;

  /** The original event that caused this event, if any. */
  originalEvent: FederatedEvent<N> | null;

  /** Flags whether propagation was stopped. */
  propagationStopped = false;

  /** Flags whether propagation was immediately stopped. */
  propagationImmediatelyStopped = false;

  /** The composed path of the event's propagation. */
  path: IEventTarget[];
  detailPath?: Array<IEventTarget[] | IEventTarget | IEventTarget[][]>;

  /** The EventManager that manages this event. Null for root events. */
  readonly manager?: EventManager;

  /** Event-specific detail */
  detail: any;

  /** The global Window object. */
  view: any;

  /** The coordinates of the event relative to the nearest DOM layer. This is a non-standard property. */
  layer: EventPoint = {
    x: 0,
    y: 0
  };
  get layerX(): number {
    return this.layer.x;
  }
  get layerY(): number {
    return this.layer.y;
  }

  /** The coordinates of the event relative to the DOM document. This is a non-standard property. */
  page: EventPoint = {
    x: 0,
    y: 0
  };
  get pageX(): number {
    return this.page.x;
  }
  get pageY(): number {
    return this.page.y;
  }

  /** The coordinates of the event relative to the canvas(origin is left-top). This is a non-standard property. */
  canvas: EventPoint = {
    x: 0,
    y: 0
  };
  get x(): number {
    return this.canvas.x;
  }
  get y(): number {
    return this.canvas.y;
  }
  get canvasX(): number {
    return this.canvas.x;
  }
  get canvasY(): number {
    return this.canvas.y;
  }

  /**
   * The coordinates of the event relative to the Viewport
   */
  viewport: EventPoint = {
    x: 0,
    y: 0
  };
  get viewX(): number {
    return this.viewport.x;
  }
  get viewY(): number {
    return this.viewport.y;
  }

  /**
   * @param ? - Which manages this event. Propagation can only occur
   *  within the ?'s jurisdiction.
   */
  constructor(manager?: EventManager) {
    this.manager = manager;
  }

  /** The propagation path for this event.*/
  composedPath(): IEventTarget[] {
    // Find the propagation path if it isn't cached or if the target has changed since the last evaluation.
    if (this.manager && (!this.path || this.path[this.path.length - 1] !== this.target)) {
      this.path = this.target ? this.manager.propagationPath(this.target) : [];
    }
    this.composedDetailPath();
    return this.path;
  }

  composedDetailPath() {
    if (this.pickParams && (this.pickParams as any).graphic) {
      this.detailPath = this.path.slice();
      this._composedDetailPath(this.pickParams);
    } else {
      this.detailPath = this.path.slice();
    }
    return this.detailPath;
  }

  _composedDetailPath(params: any) {
    if (params && params.graphic) {
      // 被包装的节点一定是最终的节点
      const g = (this.pickParams as any).graphic;
      if (g.stage) {
        const path = g.stage.eventSystem.manager.propagationPath(g);
        this.detailPath.push(path);
        this._composedDetailPath(params.params);
      }
    }
  }

  preventDefault(): void {
    try {
      if (this.nativeEvent instanceof Event && this.nativeEvent.cancelable) {
        this.nativeEvent.preventDefault();
      }
    } catch (err) {
      this.nativeEvent.preventDefault &&
        isFunction(this.nativeEvent.preventDefault) &&
        this.nativeEvent.preventDefault();
    }

    this.defaultPrevented = true;
  }

  stopImmediatePropagation(): void {
    this.propagationImmediatelyStopped = true;
  }

  stopPropagation(): void {
    try {
      if (this.nativeEvent instanceof Event && this.nativeEvent.cancelable) {
        this.nativeEvent.stopPropagation();
      }
    } catch (err) {
      this.nativeEvent.stopPropagation &&
        isFunction(this.nativeEvent.stopPropagation) &&
        this.nativeEvent.stopPropagation();
    }

    this.propagationStopped = true;
  }

  initEvent(): void {
    return;
  }
  initUIEvent(): void {
    return;
  }

  clone() {
    throw new Error('Method not implemented.');
  }

  which: number;
  readonly NONE = 0;
  readonly CAPTURING_PHASE = 1;
  readonly AT_TARGET = 2;
  readonly BUBBLING_PHASE = 3;
}
