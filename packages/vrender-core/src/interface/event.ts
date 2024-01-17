import type { INode } from './node-tree';
import type { Dict, IBounds } from '@visactor/vutils';
import type { Cursor, IGraphicAttribute } from './graphic';
import type { IDomRectLike, IEventElement } from './common';
import type { ICanvas } from './canvas';
import type { IGlobal } from './global';

export type EventPoint = {
  x: number;
  y: number;
};

export interface IEventManager {
  rootTarget: IEventTarget;
  dispatch: any;
  cursor: Cursor | string;
  addEventMapping: (type: string, fn: (e: IFederatedEvent, target: IEventTarget) => void) => void;
  dispatchEvent: (e: IFederatedEvent, type?: string) => void;
  mapEvent: (e: IFederatedEvent) => void;
  propagate: (e: IFederatedEvent, type?: string) => void;
  propagationPath: (target: IEventTarget) => IEventTarget[];
  copyWheelData: (from: IFederatedWheelEvent, to: IFederatedWheelEvent) => void;
  copyPointerData: (from: IFederatedEvent, to: IFederatedEvent) => void;
  copyMouseData: (from: IFederatedEvent, to: IFederatedEvent) => void;
  copyData: (from: IFederatedEvent, to: IFederatedEvent) => void;
}

export interface IFederatedEvent<N = Event> {
  bubbles: boolean;
  cancelBubble: boolean;
  cancelable: boolean;
  composed: boolean;
  currentTarget: IEventTarget | null;
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;
  returnValue: boolean;
  srcElement: IEventTarget;
  target: IEventTarget | null;
  timeStamp: number;
  type: string;
  nativeEvent: N;
  originalEvent: IFederatedEvent<N> | null;
  propagationStopped: boolean;
  propagationImmediatelyStopped: boolean;
  path: IEventTarget[];
  manager?: IEventManager;
  detail: any;
  view: any;
  layer: EventPoint;
  get layerX(): number;
  get layerY(): number;
  page: EventPoint;
  get pageX(): number;
  get pageY(): number;
  canvas: EventPoint;
  get x(): number;
  get y(): number;
  get canvasX(): number;
  get canvasY(): number;
  viewport: EventPoint;
  get viewX(): number;
  get viewY(): number;
  composedPath: () => IEventTarget[];
  preventDefault: () => void;
  stopImmediatePropagation: () => void;
  stopPropagation: () => void;
  initEvent: () => void;
  initUIEvent: () => void;
  clone: () => void;
  which: number;
}

export interface IFederatedMouseEvent extends IFederatedEvent {
  altKey: boolean;
  button: number;
  buttons: number;
  ctrlKey: boolean;
  metaKey: boolean;
  relatedTarget: EventTarget | null;
  shiftKey: boolean;
  client: EventPoint;
  get clientX(): number;
  get clientY(): number;
  detail: number;
  movement: EventPoint;
  get movementX(): number;
  get movementY(): number;
  offset: EventPoint;
  get offsetX(): number;
  get offsetY(): number;
  global: EventPoint;
  get globalX(): number;
  get globalY(): number;
  screen: EventPoint;
  get screenX(): number;
  get screenY(): number;
  getModifierState: (key: string) => boolean;
  initMouseEvent: (
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
  ) => void;
}

export interface IFederatedWheelEvent extends IFederatedMouseEvent {
  deltaMode: number;
  deltaX: number;
  deltaY: number;
  deltaZ: number;
  clone: () => IFederatedWheelEvent;
}

export interface IFederatedPointerEvent extends IFederatedMouseEvent {
  pointerId: number;
  width: number;
  height: number;
  isPrimary: boolean;
  pointerType: string;
  pressure: number;
  tangentialPressure: number;
  tiltX: number;
  tiltY: number;
  twist: number;
  detail: number;
  getCoalescedEvents: () => PointerEvent[];
  getPredictedEvents: () => PointerEvent[];
  clone: () => IFederatedPointerEvent;
}

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

export type LooseFunction = (...args: any[]) => any;

export type IElementLike = Omit<IEventElement, 'on' | 'off' | 'once' | 'emit' | 'removeAllListeners'> & {
  style: CSSStyleDeclaration | Record<string, any>;
  getNativeHandler?: () => ICanvas;
  getBoundingClientRect: () => IDomRectLike;
};

export type RenderConfig = {
  /**
   * 事件绑定的 canvas 元素
   */
  targetElement: IElementLike;
  /**
   * 环境分辨率
   */
  resolution: number;
  /**
   * 场景树根节点
   */
  rootNode: IEventTarget;
  global: IGlobal;
  /** 是否自动阻止事件 */
  autoPreventDefault?: boolean;
  /** 绘图视口 */
  viewport: {
    x: number;
    y: number;
    width: number;
    height: number;
    viewBox?: IBounds;
  };
  /**
   * 多次点击之间的最大时间，默认为 200 ms
   * @default 200
   */
  clickInterval?: number;

  /**
   * @since 0.17.15
   * 是否支持touch事件，不支持就不监听touch事件
   */
  supportsTouchEvents?: boolean;

  /**
   * @since 0.17.15
   * 是否支持pointer事件，不支持就监听mouse事件
   */
  supportsPointerEvents?: boolean;
};

export type NativeEvent = MouseEvent | PointerEvent | TouchEvent;

export type GraphicEventType =
  | 'pointerdown'
  | 'pointerup'
  // 指针抬起与按下的图形不同时触发
  | 'pointerupoutside'
  | 'pointertap'
  | 'pointerover'
  | 'pointerenter'
  | 'pointerleave'
  | 'pointerout'
  | 'mousedown'
  | 'mouseup'
  | 'mouseupoutside'
  // 右键操作
  | 'rightdown'
  | 'rightup'
  | 'rightupoutside'
  | 'click'
  // 双击
  | 'dblclick'
  | 'mousemove'
  | 'mouseover'
  | 'mouseout'
  // 不会冒泡
  | 'mouseenter'
  // 不会冒泡
  | 'mouseleave'
  | 'wheel'
  | 'tap'
  | 'touchstart'
  | 'touchend'
  | 'touchendoutside'
  | 'touchmove'
  | 'touchcancel'
  // dragNdrop
  | 'dragstart'
  | 'drag'
  | 'dragenter'
  | 'dragleave'
  | 'dragover'
  | 'dragend'
  | 'drop'
  // gesture
  | 'pan'
  | 'panstart'
  | 'panend'
  | 'press'
  | 'pressup'
  | 'pressend'
  | 'pinch'
  | 'pinchstart'
  | 'pinchend'
  | 'swipe';
