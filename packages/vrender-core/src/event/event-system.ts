import type { IPointLike } from '@visactor/vutils';
import { isUndefined, has, isString } from '@visactor/vutils';
import type { IGlobal, IWindow } from '../interface';
import { EventManager } from './event-manager';
import { FederatedPointerEvent, FederatedWheelEvent } from './federated-event';
import type { FederatedMouseEvent } from './federated-event/mouse-event';
import type { EventPoint, IElementLike, IEventTarget, NativeEvent, RenderConfig } from '../interface/event';
import { clock } from './util';

const MOUSE_POINTER_ID = 1;
const TOUCH_TO_POINTER: Record<string, string> = {
  touchstart: 'pointerdown',
  touchend: 'pointerup',
  touchendoutside: 'pointerupoutside',
  touchmove: 'pointermove',
  touchcancel: 'pointercancel'
};

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
 * The system for handling UI events.
 */
export class EventSystem {
  private readonly globalObj: IGlobal;
  readonly manager: EventManager;

  /** Does the device support touch events https://www.w3.org/TR/touch-events/ */
  // readonly supportsTouchEvents = 'ontouchstart' in this.globalObj;
  readonly supportsTouchEvents: boolean;

  /** Does the device support pointer events https://www.w3.org/Submission/pointer-events/ */
  // readonly supportsPointerEvents = !!this.globalObj.PointerEvent;
  readonly supportsPointerEvents: boolean;

  readonly supportsMouseEvents: boolean;

  readonly applyStyles: boolean;

  /**
   * Should default browser actions automatically be prevented.
   * Does not apply to pointer events for backwards compatibility
   * preventDefault on pointer events stops mouse events from firing
   * Thus, for every pointer event, there will always be either a mouse of touch event alongside it.
   * @default false
   */
  autoPreventDefault: boolean;

  /**
   * Dictionary of how different cursor modes are handled. Strings are handled as CSS cursor
   * values, objects are handled as dictionaries of CSS values for domElement,
   * and functions are called instead of changing the CSS.
   * Default CSS cursor values are provided for 'default' and 'pointer' modes.
   * @member {Object<string, string | ((mode: string) => void) | CSSStyleDeclaration>}
   */
  cursorStyles: Record<string, string | ((mode: string) => void) | CSSStyleDeclaration>;

  /**
   * The DOM element to which the root event listeners are bound. This is automatically set to
   */
  domElement: IElementLike | IWindow | null;

  /** The resolution used to convert between the DOM client space into world space. */
  resolution = 1;

  private currentCursor: string;
  private rootPointerEvent: FederatedPointerEvent;
  private rootWheelEvent: FederatedWheelEvent;
  private eventsAdded: boolean;

  constructor(params: RenderConfig) {
    const {
      targetElement, // 别名，避免和浏览器window重名
      resolution,
      rootNode,
      global,
      autoPreventDefault = false,
      clickInterval,
      supportsTouchEvents = global.supportsTouchEvents,
      supportsPointerEvents = global.supportsPointerEvents
    } = params;
    this.manager = new EventManager(rootNode, {
      clickInterval,
      supportsTouchEvents: supportsTouchEvents
    });

    this.globalObj = global;
    this.supportsPointerEvents = supportsPointerEvents;
    this.supportsTouchEvents = supportsTouchEvents;
    this.supportsMouseEvents = global.supportsMouseEvents;
    this.applyStyles = global.applyStyles;

    this.autoPreventDefault = autoPreventDefault;
    this.eventsAdded = false;

    this.rootPointerEvent = new FederatedPointerEvent();
    this.rootWheelEvent = new FederatedWheelEvent();

    this.cursorStyles = {
      default: 'inherit',
      pointer: 'pointer'
    };

    this.resolution = resolution;
    this.setTargetElement(targetElement);
  }

  release(): void {
    this.removeEvents();
    this.manager && this.manager.release();
    this.domElement = null;
    (this as any).manager = null;
    (this as any).globalObj = null;
  }

  setCursor(mode: string, target: IEventTarget | null | 'ignore'): void {
    if (!target && !(this.manager.rootTarget as any).window._handler.canvas.controled) {
      return;
    }

    if (!mode) {
      mode = 'default';
    }
    const { applyStyles, domElement } = this;

    if (this.currentCursor === mode) {
      return;
    }
    this.currentCursor = mode;
    const style = this.cursorStyles[mode];
    if (style) {
      if (typeof style === 'string' && applyStyles) {
        domElement.style.cursor = style;
      } else if (typeof style === 'function') {
        style(mode);
      } else if (typeof style === 'object' && applyStyles) {
        Object.assign(domElement.style, style);
      }
    } else if (applyStyles && isString(mode) && !has(this.cursorStyles, mode)) {
      domElement.style.cursor = mode;
    }
  }

  private onPointerDown = (nativeEvent: NativeEvent): void => {
    if (this.supportsTouchEvents && (nativeEvent as PointerEvent).pointerType === 'touch') {
      return;
    }

    const events = this.normalizeToPointerData(nativeEvent);

    if (this.autoPreventDefault && (events[0] as any).isNormalized) {
      const cancelable = nativeEvent.cancelable || !('cancelable' in nativeEvent);

      if (cancelable) {
        nativeEvent.preventDefault();
      }
    }

    for (let i = 0, j = events.length; i < j; i++) {
      const nativeEvent = events[i];
      const federatedEvent = this.bootstrapEvent(this.rootPointerEvent, nativeEvent);

      this.manager.mapEvent(federatedEvent);
    }

    this.setCursor(this.manager.cursor, this.manager.cursorTarget);
    // 避免内存泄露
    this.rootPointerEvent.nativeEvent = null;
  };

  private onPointerMove = (nativeEvent: NativeEvent): void => {
    if (this.supportsTouchEvents && (nativeEvent as PointerEvent).pointerType === 'touch') {
      return;
    }

    if (this.isEventOutsideOfTargetElement(nativeEvent)) {
      return;
    }

    const normalizedEvents = this.normalizeToPointerData(nativeEvent);
    for (let i = 0, j = normalizedEvents.length; i < j; i++) {
      const event = this.bootstrapEvent(this.rootPointerEvent, normalizedEvents[i]);

      this.manager.mapEvent(event);
    }

    this.setCursor(this.manager.cursor, this.manager.cursorTarget);
    // 避免内存泄露
    this.rootPointerEvent.nativeEvent = null;
  };

  private onPointerUp = (nativeEvent: NativeEvent): void => {
    if (this.supportsTouchEvents && (nativeEvent as PointerEvent).pointerType === 'touch') {
      return;
    }

    const outside = this.isEventOutsideOfTargetViewPort(nativeEvent) ? 'outside' : '';
    const normalizedEvents = this.normalizeToPointerData(nativeEvent);

    for (let i = 0, j = normalizedEvents.length; i < j; i++) {
      const event = this.bootstrapEvent(this.rootPointerEvent, normalizedEvents[i]);

      event.type += outside;

      this.manager.mapEvent(event);
    }

    this.setCursor(this.manager.cursor, this.manager.cursorTarget);
    // 避免内存泄露
    this.rootPointerEvent.nativeEvent = null;
  };

  private onPointerOverOut = (nativeEvent: NativeEvent): void => {
    if (this.supportsTouchEvents && (nativeEvent as PointerEvent).pointerType === 'touch') {
      return;
    }

    const normalizedEvents = this.normalizeToPointerData(nativeEvent);

    for (let i = 0, j = normalizedEvents.length; i < j; i++) {
      const event = this.bootstrapEvent(this.rootPointerEvent, normalizedEvents[i]);

      this.manager.mapEvent(event);
    }

    this.setCursor(this.manager.cursor, this.manager.cursorTarget);
    // 避免内存泄露
    this.rootPointerEvent.nativeEvent = null;
  };

  protected onWheel = (nativeEvent: WheelEvent): void => {
    const wheelEvent = this.normalizeWheelEvent(nativeEvent);

    this.manager.mapEvent(wheelEvent);
  };

  setTargetElement(element: IElementLike | null): void {
    this.removeEvents();
    this.domElement = element;
    this.addEvents();
  }

  private addEvents(): void {
    if (this.eventsAdded || !this.domElement) {
      return;
    }
    const { globalObj, domElement } = this;

    if (this.supportsPointerEvents) {
      if (globalObj.getDocument()) {
        globalObj.getDocument().addEventListener('pointermove', this.onPointerMove, true);
        globalObj.getDocument().addEventListener('pointerup', this.onPointerUp, true);
      } else {
        domElement.addEventListener('pointermove', this.onPointerMove, true);
        domElement.addEventListener('pointerup', this.onPointerUp, true);
      }
      domElement.addEventListener('pointerdown', this.onPointerDown, true);
      domElement.addEventListener('pointerleave', this.onPointerOverOut, true);
      domElement.addEventListener('pointerover', this.onPointerOverOut, true);
    } else {
      if (globalObj.getDocument()) {
        globalObj.getDocument().addEventListener('mousemove', this.onPointerMove, true);
        globalObj.getDocument().addEventListener('mouseup', this.onPointerUp, true);
      } else {
        domElement.addEventListener('mousemove', this.onPointerMove, true);
        domElement.addEventListener('mouseup', this.onPointerUp, true);
      }
      domElement.addEventListener('mousedown', this.onPointerDown, true);
      domElement.addEventListener('mouseout', this.onPointerOverOut, true);
      domElement.addEventListener('mouseover', this.onPointerOverOut, true);
    }

    if (this.supportsTouchEvents) {
      domElement.addEventListener('touchstart', this.onPointerDown, true);
      domElement.addEventListener('touchend', this.onPointerUp, true);
      domElement.addEventListener('touchmove', this.onPointerMove, true);
    }

    domElement.addEventListener('wheel', this.onWheel, {
      capture: true
    });

    this.eventsAdded = true;
  }

  private removeEvents(): void {
    if (!this.eventsAdded || !this.domElement) {
      return;
    }
    const { globalObj, domElement } = this;

    if (this.supportsPointerEvents) {
      if (globalObj.getDocument()) {
        globalObj.getDocument().removeEventListener('pointermove', this.onPointerMove, true);
        globalObj.getDocument().removeEventListener('pointerup', this.onPointerUp, true);
      } else {
        domElement.removeEventListener('pointermove', this.onPointerMove, true);
        domElement.removeEventListener('pointerup', this.onPointerUp, true);
      }
      domElement.removeEventListener('pointerdown', this.onPointerDown, true);
      domElement.removeEventListener('pointerleave', this.onPointerOverOut, true);
      domElement.removeEventListener('pointerover', this.onPointerOverOut, true);
    } else {
      if (globalObj.getDocument()) {
        globalObj.getDocument().removeEventListener('mousemove', this.onPointerMove, true);
        globalObj.getDocument().removeEventListener('mouseup', this.onPointerUp, true);
      } else {
        domElement.removeEventListener('mousemove', this.onPointerMove, true);
        domElement.removeEventListener('mouseup', this.onPointerUp, true);
      }
      domElement.removeEventListener('mousedown', this.onPointerDown, true);
      domElement.removeEventListener('mouseout', this.onPointerOverOut, true);
      domElement.removeEventListener('mouseover', this.onPointerOverOut, true);
    }

    if (this.supportsTouchEvents) {
      domElement.removeEventListener('touchstart', this.onPointerDown, true);
      domElement.removeEventListener('touchend', this.onPointerUp, true);
      domElement.removeEventListener('touchmove', this.onPointerMove, true);
    }

    domElement.removeEventListener('wheel', this.onWheel, true);

    this.domElement = null;
    this.eventsAdded = false;
  }

  private mapToViewportPoint(event: IPointLike): EventPoint {
    if ((this.domElement as IWindow).pointTransform) {
      return (this.domElement as IWindow).pointTransform(event.x, event.y);
    }
    return event;
  }

  private mapToCanvasPoint(nativeEvent: PointerEvent | WheelEvent | TouchEvent): EventPoint {
    const point = this.globalObj?.mapToCanvasPoint(nativeEvent, this.domElement);

    if (point) {
      return point;
    }

    let x: number = 0;
    let y: number = 0;
    if ((nativeEvent as TouchEvent).changedTouches) {
      const data = (nativeEvent as TouchEvent).changedTouches[0] ?? ({} as any);
      x = data.clientX || 0;
      y = data.clientY || 0;
    } else {
      x = (nativeEvent as PointerEvent | WheelEvent).clientX || 0;
      y = (nativeEvent as PointerEvent | WheelEvent).clientY || 0;
    }
    const rect = this.domElement.getBoundingClientRect();
    return {
      x: x - rect.left,
      y: y - rect.top
    };
  }

  private normalizeToPointerData(event: TouchEvent | MouseEvent | PointerEvent): PointerEvent[] {
    const normalizedEvents = [];

    if (
      this.supportsTouchEvents &&
      (event as TouchEvent).changedTouches &&
      (event as TouchEvent).changedTouches.length
    ) {
      for (let i = 0, li = (event as TouchEvent).changedTouches.length; i < li; i++) {
        const touch = (event as TouchEvent).changedTouches[i] as VRenderTouch;

        if (isUndefined(touch.button)) {
          touch.button = 0;
        }
        if (isUndefined(touch.buttons)) {
          touch.buttons = 1;
        }
        if (isUndefined(touch.isPrimary)) {
          touch.isPrimary = (event as TouchEvent).touches.length === 1 && event.type === 'touchstart';
        }
        if (isUndefined(touch.width)) {
          touch.width = touch.radiusX || 1;
        }
        if (isUndefined(touch.height)) {
          touch.height = touch.radiusY || 1;
        }
        if (isUndefined(touch.tiltX)) {
          touch.tiltX = 0;
        }
        if (isUndefined(touch.tiltY)) {
          touch.tiltY = 0;
        }
        if (isUndefined(touch.pointerType)) {
          touch.pointerType = 'touch';
        }
        if (isUndefined(touch.pointerId)) {
          touch.pointerId = touch.identifier || 0;
        }
        if (isUndefined(touch.pressure)) {
          touch.pressure = touch.force || 0.5;
        }
        if (isUndefined(touch.twist)) {
          touch.twist = 0;
        }
        if (isUndefined(touch.tangentialPressure)) {
          touch.tangentialPressure = 0;
        }
        if (isUndefined(touch.layerX)) {
          touch.layerX = touch.offsetX = touch.clientX;
        }
        if (isUndefined(touch.layerY)) {
          touch.layerY = touch.offsetY = touch.clientY;
        }

        touch.isNormalized = true;
        touch.type = event.type;

        normalizedEvents.push(touch);
      }
    } else if (
      !this.globalObj.supportsMouseEvents ||
      (event instanceof MouseEvent && (!this.supportsPointerEvents || !(event instanceof PointerEvent)))
    ) {
      const tempEvent = event as VRenderPointerEvent;

      if (isUndefined(tempEvent.isPrimary)) {
        tempEvent.isPrimary = true;
      }
      if (isUndefined(tempEvent.width)) {
        tempEvent.width = 1;
      }
      if (isUndefined(tempEvent.height)) {
        tempEvent.height = 1;
      }
      if (isUndefined(tempEvent.tiltX)) {
        tempEvent.tiltX = 0;
      }
      if (isUndefined(tempEvent.tiltY)) {
        tempEvent.tiltY = 0;
      }
      if (isUndefined(tempEvent.pointerType)) {
        tempEvent.pointerType = 'mouse';
      }
      if (isUndefined(tempEvent.pointerId)) {
        tempEvent.pointerId = MOUSE_POINTER_ID;
      }
      if (isUndefined(tempEvent.pressure)) {
        tempEvent.pressure = 0.5;
      }
      if (isUndefined(tempEvent.twist)) {
        tempEvent.twist = 0;
      }
      if (isUndefined(tempEvent.tangentialPressure)) {
        tempEvent.tangentialPressure = 0;
      }

      tempEvent.isNormalized = true;

      normalizedEvents.push(tempEvent);
    } else {
      normalizedEvents.push(event);
    }

    return normalizedEvents as PointerEvent[];
  }

  protected normalizeWheelEvent(nativeEvent: WheelEvent): FederatedWheelEvent {
    const event = this.rootWheelEvent;

    this.transferMouseData(event, nativeEvent);

    event.deltaMode = nativeEvent.deltaMode;
    event.deltaX = nativeEvent.deltaX;
    event.deltaY = nativeEvent.deltaY;
    event.deltaZ = nativeEvent.deltaZ;

    // 获取相对画布坐标
    const { x: canvasX, y: canvasY } = this.mapToCanvasPoint(nativeEvent);
    event.canvas.x = canvasX;
    event.canvas.y = canvasY;

    event.global.x = canvasX;
    event.global.y = canvasY;

    event.offset.x = canvasX;
    event.offset.y = canvasY;

    // 获取相对绘图区域(viewport)坐标
    const { x: viewX, y: viewY } = this.mapToViewportPoint(event);
    event.viewport.x = viewX;
    event.viewport.y = viewY;

    event.nativeEvent = nativeEvent;
    event.type = nativeEvent.type;

    return event;
  }

  /**
   * Normalizes the {@code nativeEvent} into a federateed {@code FederatedPointerEvent}.
   * @param event
   * @param nativeEvent
   */
  private bootstrapEvent(event: FederatedPointerEvent, nativeEvent: PointerEvent): FederatedPointerEvent {
    event.originalEvent = null;
    event.nativeEvent = nativeEvent;

    event.pointerId = nativeEvent.pointerId;
    event.width = nativeEvent.width;
    event.height = nativeEvent.height;
    event.isPrimary = nativeEvent.isPrimary;
    event.pointerType = nativeEvent.pointerType;
    event.pressure = nativeEvent.pressure;
    event.tangentialPressure = nativeEvent.tangentialPressure;
    event.tiltX = nativeEvent.tiltX;
    event.tiltY = nativeEvent.tiltY;
    event.twist = nativeEvent.twist;
    this.transferMouseData(event, nativeEvent);

    const { x: canvasX, y: canvasY } = this.mapToCanvasPoint(nativeEvent);
    event.canvas.x = canvasX;
    event.canvas.y = canvasY;

    event.global.x = canvasX;
    event.global.y = canvasY;

    event.offset.x = canvasX;
    event.offset.y = canvasY;

    // 获取相对绘图区域(viewport)坐标
    const { x: viewX, y: viewY } = this.mapToViewportPoint(event);
    event.viewport.x = viewX;
    event.viewport.y = viewY;

    event.isTrusted = nativeEvent.isTrusted;
    if (event.type === 'pointerleave') {
      event.type = 'pointerout';
    }
    if (event.type.startsWith('mouse')) {
      event.type = event.type.replace('mouse', 'pointer');
    }
    if (event.type.startsWith('touch')) {
      event.type = TOUCH_TO_POINTER[event.type] || event.type;
    }

    return event;
  }

  /**
   * Transfers base & mouse event data from the {@code nativeEvent} to the federated event.
   * @param event
   * @param nativeEvent
   */
  private transferMouseData(event: FederatedMouseEvent, nativeEvent: MouseEvent): void {
    event.isTrusted = nativeEvent.isTrusted;
    event.srcElement = nativeEvent.srcElement as IEventTarget;
    event.timeStamp = clock.now();
    event.type = nativeEvent.type;

    event.altKey = nativeEvent.altKey;
    event.button = nativeEvent.button;
    event.buttons = nativeEvent.buttons;
    event.client.x = nativeEvent.clientX;
    event.client.y = nativeEvent.clientY;
    event.ctrlKey = nativeEvent.ctrlKey;
    event.shiftKey = nativeEvent.shiftKey;
    event.metaKey = nativeEvent.metaKey;
    event.movement.x = nativeEvent.movementX;
    event.movement.y = nativeEvent.movementY;
    event.page.x = nativeEvent.pageX;
    event.page.y = nativeEvent.pageY;
    event.relatedTarget = null;
  }

  private isEventOutsideOfTargetViewPort(nativeEvent: NativeEvent) {
    if (this.isEventOutsideOfTargetElement(nativeEvent)) {
      return true;
    }

    // 判断点是否在区间内
    if ((this.domElement as IWindow).getViewBox) {
      const p = this.mapToViewportPoint(this.mapToCanvasPoint(nativeEvent as any));
      const b = (this.domElement as IWindow).getViewBox();
      const w = b.width();
      const h = b.height();
      const contain = p.x < w && p.y < h && p.x > 0 && p.y > 0;
      return !contain;
    }
    return false;
  }

  private isEventOutsideOfTargetElement(nativeEvent: NativeEvent) {
    let target = nativeEvent.target;

    if (nativeEvent.composedPath && nativeEvent.composedPath().length > 0) {
      target = nativeEvent.composedPath()[0];
    }

    const nativeElement = this.domElement.getNativeHandler
      ? this.domElement.getNativeHandler().nativeCanvas
      : this.domElement;

    return target !== nativeElement;
  }

  pauseTriggerEvent() {
    this.manager.pauseNotify = true;
  }
  resumeTriggerEvent() {
    this.manager.pauseNotify = false;
  }
}

interface VRenderPointerEvent extends PointerEvent {
  isPrimary: boolean;
  width: number;
  height: number;
  tiltX: number;
  tiltY: number;
  pointerType: string;
  pointerId: number;
  pressure: number;
  twist: number;
  tangentialPressure: number;
  isNormalized: boolean;
  type: string;
}

interface VRenderTouch extends Touch {
  button: number;
  buttons: number;
  isPrimary: boolean;
  width: number;
  height: number;
  tiltX: number;
  tiltY: number;
  pointerType: string;
  pointerId: number;
  pressure: number;
  twist: number;
  tangentialPressure: number;
  layerX: number;
  layerY: number;
  offsetX: number;
  offsetY: number;
  isNormalized: boolean;
  type: string;
}
