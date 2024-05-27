import { FederatedMouseEvent } from './mouse-event';
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

export class FederatedWheelEvent extends FederatedMouseEvent implements WheelEvent {
  /**
   * The units of `deltaX`, `deltaY`, and `deltaZ`. This is one of `DOM_DELTA_LINE`,
   * `DOM_DELTA_PAGE`, `DOM_DELTA_PIXEL`.
   */
  deltaMode: number;

  /** Horizontal scroll amount */
  deltaX: number;

  /** Vertical scroll amount */
  deltaY: number;

  /** z-axis scroll amount. */
  deltaZ: number;

  static readonly DOM_DELTA_PIXEL = 0;

  readonly DOM_DELTA_PIXEL = 0;

  static readonly DOM_DELTA_LINE = 1;

  readonly DOM_DELTA_LINE = 1;

  static readonly DOM_DELTA_PAGE = 2;

  readonly DOM_DELTA_PAGE = 2;

  clone() {
    const event = new FederatedWheelEvent(this.manager);

    event.eventPhase = event.NONE;
    event.currentTarget = null;
    event.path = [];
    event.detailPath = [];
    event.target = null;

    event.nativeEvent = this.nativeEvent;
    event.originalEvent = this.originalEvent;

    this.manager?.copyWheelData(this, event);
    this.manager?.copyMouseData(this, event);
    this.manager?.copyData(this, event);

    event.target = this.target;
    event.path = this.composedPath().slice();
    const p = this.composedDetailPath();
    event.detailPath = p && p.slice();
    event.type = this.type;

    return event;
  }
}
