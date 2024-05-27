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

/**
 * A FederatedEvent for pointer events.
 */
export class FederatedPointerEvent extends FederatedMouseEvent implements PointerEvent {
  declare pickParams?: any;
  /**
   * The unique identifier of the pointer.
   */
  pointerId: number;

  /**
   * The width of the pointer's contact along the x-axis, measured in CSS pixels.
   * radiusX of TouchEvents will be represented by this value.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/width
   */
  width = 0;

  /**
   * The height of the pointer's contact along the y-axis, measured in CSS pixels.
   * radiusY of TouchEvents will be represented by this value.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/height
   */
  height = 0;

  /**
   * Indicates whether or not the pointer device that created the event is the primary pointer.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/isPrimary
   */
  isPrimary = false;

  /**
   * The type of pointer that triggered the event.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType
   */
  pointerType: string;

  /**
   * Pressure applied by the pointing device during the event.
   *s
   * A Touch's force property will be represented by this value.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pressure
   */
  pressure: number;

  /**
   * Barrel pressure on a stylus pointer.
   * @see https://w3c.github.io/pointerevents/#pointerevent-interface
   */
  tangentialPressure: number;

  /**
   * The angle, in degrees, between the pointer device and the screen.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltX
   */
  tiltX: number;

  /**
   * The angle, in degrees, between the pointer device and the screen.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltY
   */
  tiltY: number;

  /**
   * Twist of a stylus pointer.
   * @see https://w3c.github.io/pointerevents/#pointerevent-interface
   */
  twist: number;

  /** This is the number of clicks that occurs in 200ms/click of each other. */
  declare detail: number;

  getCoalescedEvents(): PointerEvent[] {
    if (this.type === 'pointermove' || this.type === 'mousemove' || this.type === 'touchmove') {
      return [this];
    }

    return [];
  }

  getPredictedEvents(): PointerEvent[] {
    throw new Error('getPredictedEvents is not supported!');
  }

  clone() {
    const event = new FederatedPointerEvent(this.manager);

    event.eventPhase = event.NONE;
    event.currentTarget = null;
    event.path = [];
    event.detailPath = [];
    event.target = null;

    event.nativeEvent = this.nativeEvent;
    event.originalEvent = this.originalEvent;

    this.manager?.copyPointerData(this, event);
    this.manager?.copyMouseData(this, event);
    this.manager?.copyData(this, event);

    // copy propagation path for perf
    event.target = this.target;
    event.path = this.composedPath().slice();
    const p = this.composedDetailPath();
    event.detailPath = p && p.slice();
    event.type = this.type;

    return event;
  }
}
