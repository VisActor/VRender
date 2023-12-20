import { FederatedEvent } from './base-event';
import type { EventPoint } from '../../interface';
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
 * A FederatedEvent for mouse events.
 */
export class FederatedMouseEvent extends FederatedEvent<MouseEvent | PointerEvent | TouchEvent> implements MouseEvent {
  /** Whether the "alt" key was pressed when this mouse event occurred. */
  altKey: boolean;

  /** The specific button that was pressed in this mouse event. */
  button: number;

  /** The button depressed when this event occurred. */
  buttons: number;

  /** Whether the "control" key was pressed when this mouse event occurred. */
  ctrlKey: boolean;

  /** Whether the "meta" key was pressed when this mouse event occurred. */
  metaKey: boolean;

  /** This is currently not implemented in the Federated Events API. */
  relatedTarget: EventTarget | null;

  /** Whether the "shift" key was pressed when this mouse event occurred. */
  shiftKey: boolean;

  /** The coordinates of the mouse event relative to the canvas. */
  client: EventPoint = {
    x: 0,
    y: 0
  };

  public get clientX(): number {
    return this.client.x;
  }

  public get clientY(): number {
    return this.client.y;
  }

  /** This is the number of clicks that occurs in 200ms/click of each other. */
  declare detail: number;

  /** The movement in this pointer relative to the last `mousemove` event. */
  movement: EventPoint = {
    x: 0,
    y: 0
  };

  /** @readonly */
  get movementX(): number {
    return this.movement.x;
  }

  /** @readonly */
  get movementY(): number {
    return this.movement.y;
  }

  /**
   * The offset of the pointer coordinates w.r.t. target DisplayObject in world space. This is
   * not supported at the moment.
   */
  offset: EventPoint = {
    x: 0,
    y: 0
  };

  /** @readonly */
  get offsetX(): number {
    return this.offset.x;
  }

  /** @readonly */
  get offsetY(): number {
    return this.offset.y;
  }

  /** The pointer coordinates in world space. */
  global: EventPoint = {
    x: 0,
    y: 0
  };

  /** @readonly */
  get globalX(): number {
    return this.global.x;
  }

  /** @readonly */
  get globalY(): number {
    return this.global.y;
  }

  screen: EventPoint = {
    x: 0,
    y: 0
  };
  /** @readonly */
  get screenX(): number {
    return this.screen.x;
  }
  /** @readonly */
  get screenY(): number {
    return this.screen.y;
  }

  /**
   * Whether the modifier key was pressed when this event natively occurred.
   * @param key - The modifier key.
   */
  getModifierState(key: string): boolean {
    return 'getModifierState' in this.nativeEvent && this.nativeEvent.getModifierState(key);
  }

  /**
   * Not supported.
   * @param _typeArg
   * @param _canBubbleArg
   * @param _cancelableArg
   * @param _viewArg
   * @param _detailArg
   * @param _screenXArg
   * @param _screenYArg
   * @param _clientXArg
   * @param _clientYArg
   * @param _ctrlKeyArg
   * @param _altKeyArg
   * @param _shiftKeyArg
   * @param _metaKeyArg
   * @param _buttonArg
   * @param _relatedTargetArg
   * @deprecated
   */
  // eslint-disable-next-line max-params
  initMouseEvent(
    _typeArg: string,
    _canBubbleArg: boolean,
    _cancelableArg: boolean,
    _viewArg: Window,
    _detailArg: number,
    _screenXArg: number,
    _screenYArg: number,
    _clientXArg: number,
    _clientYArg: number,
    _ctrlKeyArg: boolean,
    _altKeyArg: boolean,
    _shiftKeyArg: boolean,
    _metaKeyArg: boolean,
    _buttonArg: number,
    _relatedTargetArg: EventTarget
  ): void {
    throw new Error('Method not implemented.');
  }
}
