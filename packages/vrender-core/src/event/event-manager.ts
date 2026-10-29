import { InputSource } from './input-source';
import type { Dict } from '@visactor/vutils';
import { EventEmitter, Logger, get } from '@visactor/vutils';
import { FederatedMouseEvent, FederatedPointerEvent, FederatedWheelEvent } from './federated-event';
import type { IEventTarget } from '../interface/event';
import { WILDCARD } from './constant';
import type { FederatedEvent } from './federated-event/base-event';
import { clock } from './util';
import type { Cursor, IGraphic } from '../interface';
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

// The maximum iterations used in propagation. This prevent infinite loops.
const PROPAGATION_LIMIT = 2048;

type TrackingData = {
  generation: number;
  inside: boolean;
  previousInside: boolean;
  ending?: IEventTarget[];
  pointerType: string;
  button: number;
  canvasX: number;
  canvasY: number;
  viewX: number;
  viewY: number;

  pressTargetsByButton: {
    [id: number]: IEventTarget[];
  };
  clicksByButton: {
    [id: number]: {
      clickCount: number;
      target: IEventTarget;
      timeStamp: number;
    };
  };
  overTargets: IEventTarget[];
};

type EventManagerConfig = {
  /**
   * 多次点击之间的最大时间，默认为 200 ms
   * @default 200
   */
  clickInterval?: number;
  supportsTouchEvents?: boolean;
};

type EmitterListener = { fn: (...args: any[]) => any; context: any; once: boolean };
type EmitterListeners = Record<string, EmitterListener | EmitterListener[]>;

function isMouseLike(pointerType: string) {
  return pointerType === 'mouse' || pointerType === 'pen';
}

const DEFAULT_CLICK_INTERVAL = 200;
const TOUCH_INPUT_TYPES: Record<string, string> = {
  pointerdown: 'touchstart',
  pointermove: 'touchmove',
  pointerup: 'touchend'
};
const MOUSE_INPUT_TYPES: Record<string, string> = {
  pointerdown: 'mousedown',
  pointermove: 'mousemove',
  pointerup: 'mouseup'
};

export class EventManager {
  rootTarget: IEventTarget;

  dispatch: any = new EventEmitter();

  cursor: Cursor | string;
  cursorTarget: IEventTarget | null = null;
  pauseNotify: boolean = false;

  protected mappingTable: Record<
    string,
    Array<{
      fn: (e: FederatedEvent, target: IEventTarget) => void;
      priority: number;
    }>
  >;

  protected mappingState: Record<string, any> = {
    trackingData: {}
  };

  protected eventPool: Map<typeof FederatedEvent, FederatedEvent[]> = new Map();

  // 缓存上一个坐标点的拾取结果，用于优化在同一个点连续触发事件的拾取逻辑
  private _prePointTargetCache: Dict<IEventTarget> & { stageRenderCount: number };

  private _config: EventManagerConfig;

  constructor(root: IEventTarget, config: EventManagerConfig) {
    this.rootTarget = root;
    this.mappingTable = {};
    this._config = {
      clickInterval: DEFAULT_CLICK_INTERVAL,
      ...config
    };
    this.addEventMapping('pointerdown', this.onPointerDown);
    this.addEventMapping('pointermove', this.onPointerMove);
    this.addEventMapping('pointerout', this.onPointerOut);
    this.addEventMapping('pointerleave', this.onPointerOut);
    this.addEventMapping('pointerover', this.onPointerOver);
    this.addEventMapping('pointerup', this.onPointerUp);
    this.addEventMapping('pointerupoutside', this.onPointerUpOutside);
    this.addEventMapping('pointercancel', this.onPointerCancel);
    this.addEventMapping('wheel', this.onWheel);
  }

  private readonly canvasInput = new InputSource();
  private readonly windowInput = new InputSource();
  readonly input = { canvas: this.canvasInput.source, window: this.windowInput.source };
  private currentTracking?: TrackingData;
  private currentGeneration = 0;
  private terminalDepth = 0;
  private dispatchingEvent?: FederatedEvent;

  private inputValid = (): boolean =>
    !!this.rootTarget &&
    (this.terminalDepth > 0 || !this.currentTracking || this.currentTracking.generation === this.currentGeneration);

  hasPointer(id: number): boolean {
    const data = this.mappingState.trackingData[id] as TrackingData;
    if (!data) {
      return false;
    }
    if (data.inside || data.ending) {
      return true;
    }
    for (const button in data.pressTargetsByButton) {
      if (data.pressTargetsByButton[button]) {
        return true;
      }
    }
    return false;
  }

  cancelAllPointers(): void {
    for (const id in this.mappingState.trackingData) {
      this.cancelPointer(Number(id));
    }
  }

  cancelPointer(id: number): void {
    if (!this.rootTarget || !this.hasPointer(id)) {
      return;
    }
    const data = this.trackingData(id);
    let press = data.ending;
    for (const button in data.pressTargetsByButton) {
      press = data.pressTargetsByButton[button];
      break;
    }
    const over = data.overTargets;
    const inside = data.inside;
    // Commit the terminal state before any callback, including capture listeners.
    data.generation++;
    data.pressTargetsByButton = {};
    data.clicksByButton = {};
    data.ending = undefined;
    data.inside = false;
    data.overTargets = [];
    this.dispatchingEvent?.stopImmediatePropagation();
    const event = this.allocateEvent(FederatedPointerEvent);
    event.type = 'pointercancel';
    event.pointerId = id;
    event.pointerType = data.pointerType;
    event.button = data.button;
    event.nativeEvent = null;
    event.canvas.x = data.canvasX;
    event.canvas.y = data.canvasY;
    event.viewport.x = data.viewX;
    event.viewport.y = data.viewY;
    event.target = this.findMountedTarget(press) ?? this.findMountedTarget(over);
    this.terminalDepth++;
    try {
      this.dispatchEvent(event);
      if (event.pointerType === 'touch') {
        this.dispatchEvent(event, 'touchcancel');
      }
      this.windowInput.emit('pointercancel', event, this.inputValid);
      if (event.pointerType === 'touch') {
        this.windowInput.emit('touchcancel', event, this.inputValid);
      }
      if (inside) {
        this.canvasInput.emit('pointercancel', event, this.inputValid);
        if (event.pointerType === 'touch') {
          this.canvasInput.emit('touchcancel', event, this.inputValid);
        }
        this.emitBoundary(event, false);
      }
      if (over?.length && this.rootTarget) {
        event.target = this.findMountedTarget(over);
        event.path = [];
        this.dispatchEvent(event, 'pointerout');
        if (isMouseLike(event.pointerType)) {
          this.dispatchEvent(event, 'mouseout');
        }
        event.eventPhase = event.AT_TARGET;
        while (event.target && this.rootTarget) {
          event.currentTarget = event.target;
          this.notifyTarget(event, 'pointerleave');
          if (isMouseLike(event.pointerType)) {
            this.notifyTarget(event, 'mouseleave');
          }
          event.target = event.target.parent as IEventTarget;
        }
      }
    } finally {
      this.terminalDepth--;
      this.freeEvent(event);
      this.cursorTarget = null;
      this.cursor = '';
    }
  }

  private emitBoundary(event: FederatedPointerEvent, inside: boolean): void {
    this.canvasInput.emit(inside ? 'pointerover' : 'pointerout', event, this.inputValid);
    this.canvasInput.emit(inside ? 'pointerenter' : 'pointerleave', event, this.inputValid);
    if (isMouseLike(event.pointerType)) {
      this.canvasInput.emit(inside ? 'mouseover' : 'mouseout', event, this.inputValid);
      this.canvasInput.emit(inside ? 'mouseenter' : 'mouseleave', event, this.inputValid);
    }
  }

  private emitInput(event: FederatedMouseEvent, type = event.type): void {
    if (!this.inputValid()) {
      return;
    }
    this.windowInput.emit(type, event, this.inputValid);
    if (!this.inputValid()) {
      return;
    }
    const data = event instanceof FederatedPointerEvent ? this.trackingData(event.pointerId) : undefined;
    if (data && data.previousInside !== data.inside) {
      data.previousInside = data.inside;
      this.emitBoundary(event as FederatedPointerEvent, data.inside);
    }
    if (!data || data.inside) {
      this.canvasInput.emit(type, event, this.inputValid);
    }
  }

  private emitPointerInput(event: FederatedPointerEvent, type = event.type): void {
    if (!this.inputValid()) {
      return;
    }
    // Native over/out represent logical transitions only, not sibling mark transitions.
    if (type === 'pointerover' || type === 'pointerout' || type === 'pointerleave') {
      const data = this.trackingData(event.pointerId);
      if (data.previousInside !== data.inside) {
        data.previousInside = data.inside;
        this.emitBoundary(event, data.inside);
      }
      return;
    }
    this.emitInput(event, type);
    if (event.pointerType === 'touch') {
      const alias = TOUCH_INPUT_TYPES[type];
      if (alias) {
        this.emitInput(event, alias);
      }
    } else if (isMouseLike(event.pointerType)) {
      const alias =
        event.button === 2 && type === 'pointerdown'
          ? 'rightdown'
          : event.button === 2 && type === 'pointerup'
            ? 'rightup'
            : MOUSE_INPUT_TYPES[type];
      if (alias) {
        this.emitInput(event, alias);
      }
    }
  }

  protected onPointerCancel = (from: FederatedEvent): void => {
    if (from instanceof FederatedPointerEvent) {
      this.cancelPointer(from.pointerId);
    }
  };

  addEventMapping(type: string, fn: (e: FederatedEvent, target: IEventTarget) => void): void {
    if (!this.mappingTable[type]) {
      this.mappingTable[type] = [];
    }

    this.mappingTable[type].push({
      fn,
      priority: 0
    });
    this.mappingTable[type].sort((a, b) => a.priority - b.priority);
  }

  dispatchEvent(e: FederatedEvent, type?: string): void {
    if (!this.inputValid()) {
      return;
    }
    const previous = this.dispatchingEvent;
    this.dispatchingEvent = e;
    e.propagationStopped = false;
    e.propagationImmediatelyStopped = false;

    try {
      this.propagate(e, type);
      if (this.inputValid()) {
        this.dispatch.emit(type || e.type, e);
      }
    } finally {
      this.dispatchingEvent = previous;
    }
  }

  mapEvent(e: FederatedEvent, inViewport = true): void {
    if (!this.rootTarget) {
      return;
    }
    const previous = this.currentTracking;
    const generation = this.currentGeneration;
    const tracking = e instanceof FederatedPointerEvent ? this.trackingData(e.pointerId) : undefined;
    this.currentTracking = tracking;
    this.currentGeneration = tracking?.generation ?? 0;
    if (tracking) {
      tracking.previousInside = tracking.inside;
      tracking.inside = inViewport;
      tracking.pointerType = (e as FederatedPointerEvent).pointerType;
      tracking.button = (e as FederatedPointerEvent).button;
      tracking.canvasX = e.canvasX;
      tracking.canvasY = e.canvasY;
      tracking.viewX = e.viewX;
      tracking.viewY = e.viewY;
    }
    const type = e.type === 'pointerup' && !inViewport ? 'pointerupoutside' : e.type;
    const mappers = this.mappingTable[type];
    try {
      let target;
      const cacheKey = `${e.canvasX}-${e.canvasY}`;
      if (!inViewport) {
        target = null;
      } else if (
        this._prePointTargetCache?.[cacheKey] &&
        (this._prePointTargetCache?.[cacheKey] as unknown as IGraphic)?.stage &&
        (this._prePointTargetCache?.[cacheKey] as unknown as IGraphic)?.stage.renderCount ===
          (this._prePointTargetCache?.stageRenderCount as number)
      ) {
        target = this._prePointTargetCache[cacheKey];
      } else {
        target = this.pickTarget(e.viewX, e.viewY, e);
        // 缓存上一个坐标点的拾取结果，减少拾取的次数，如 pointermove pointerdown 和 pointerup 在同一个点触发
        // 如果存在params，那么就不缓存
        if (!(e as any).pickParams) {
          this._prePointTargetCache = {
            [cacheKey]: target,
            stageRenderCount: target?.stage.renderCount ?? -1
          };
        }
      }

      if (mappers) {
        for (let i = 0, j = mappers.length; i < j && this.inputValid(); i++) {
          mappers[i].fn(e, target);
        }
      } else {
        Logger.getInstance().warn(`[EventManager]: Event mapping not defined for ${e.type}`);
      }
      if (
        e instanceof FederatedPointerEvent &&
        type !== 'pointerup' &&
        type !== 'pointerupoutside' &&
        type !== 'pointercancel'
      ) {
        this.emitPointerInput(e);
      } else if (e instanceof FederatedWheelEvent) {
        this.emitInput(e);
      }
    } finally {
      if (tracking) {
        tracking.ending = undefined;
      }
      this.currentTracking = previous;
      this.currentGeneration = generation;
    }
  }

  propagate(e: FederatedEvent, type?: string): void {
    if (!e.target) {
      return;
    }

    const composedPath = e.composedPath();

    e.eventPhase = e.CAPTURING_PHASE;

    for (let i = 0, j = composedPath.length - 1; i < j; i++) {
      e.currentTarget = composedPath[i];

      this.notifyTarget(e, type);

      if (e.propagationStopped || e.propagationImmediatelyStopped) {
        return;
      }
    }

    e.eventPhase = e.AT_TARGET;
    e.currentTarget = e.target;

    this.notifyTarget(e, type);

    if (e.propagationStopped || e.propagationImmediatelyStopped) {
      return;
    }

    e.eventPhase = e.BUBBLING_PHASE;

    for (let i = composedPath.length - 2; i >= 0; i--) {
      e.currentTarget = composedPath[i];
      this.notifyTarget(e, type);

      if (e.propagationStopped || e.propagationImmediatelyStopped) {
        return;
      }
    }
  }

  propagationPath(target: IEventTarget): IEventTarget[] {
    const propagationPath = [target];

    for (let i = 0; i < PROPAGATION_LIMIT && target !== this.rootTarget && target.parent; i++) {
      if (!target.parent) {
        throw new Error('Cannot find propagation path to disconnected target');
      }

      propagationPath.push(target.parent);

      target = target.parent;
    }

    propagationPath.reverse();

    return propagationPath;
  }

  protected notifyTarget(e: FederatedEvent, type?: string): void {
    if (!this.inputValid()) {
      e.stopImmediatePropagation();
      return;
    }
    if (this.pauseNotify) {
      return;
    }
    type = type ?? e.type;
    const key = e.eventPhase === e.CAPTURING_PHASE || e.eventPhase === e.AT_TARGET ? `${type}capture` : type;

    this.notifyListeners(e, key);

    if (e.eventPhase === e.AT_TARGET && this.inputValid() && !e.propagationImmediatelyStopped) {
      this.notifyListeners(e, type);
    }
  }

  protected onPointerDown = (from: FederatedEvent, target: IEventTarget) => {
    if (!(from instanceof FederatedPointerEvent)) {
      Logger.getInstance().warn('EventManager cannot map a non-pointer event as a pointer event');

      return;
    }

    const e = this.createPointerEvent(from, from.type, target);

    const trackingData = this.trackingData(from.pointerId);
    trackingData.pressTargetsByButton[from.button] = e.composedPath();
    this.dispatchEvent(e, 'pointerdown');

    if (e.pointerType === 'touch') {
      this.dispatchEvent(e, 'touchstart');
    } else if (isMouseLike(e.pointerType)) {
      const isRightButton = e.button === 2;

      this.dispatchEvent(e, isRightButton ? 'rightdown' : 'mousedown');
    }

    this.freeEvent(e);
  };

  protected onPointerMove = (from: FederatedEvent, target: IEventTarget) => {
    if (!(from instanceof FederatedPointerEvent)) {
      Logger.getInstance().warn('EventManager cannot map a non-pointer event as a pointer event');

      return;
    }

    const e = this.createPointerEvent(from, from.type, target);
    const isMouse = isMouseLike(e.pointerType);
    const trackingData = this.trackingData(from.pointerId);
    const outTarget = this.findMountedTarget(trackingData.overTargets);

    if (trackingData.overTargets && outTarget && outTarget !== this.rootTarget && outTarget !== e.target) {
      const outType = from.type === 'mousemove' ? 'mouseout' : 'pointerout';
      const outEvent = this.createPointerEvent(from, outType, outTarget || undefined);

      this.dispatchEvent(outEvent, 'pointerout');
      if (isMouse) {
        this.dispatchEvent(outEvent, 'mouseout');
      }
      if (!e.composedPath().includes(outTarget!)) {
        const leaveEvent = this.createPointerEvent(from, 'pointerleave', outTarget || undefined);

        leaveEvent.eventPhase = leaveEvent.AT_TARGET;

        while (leaveEvent.target && !e.composedPath().includes(leaveEvent.target)) {
          leaveEvent.currentTarget = leaveEvent.target;

          this.notifyTarget(leaveEvent);
          if (isMouse) {
            this.notifyTarget(leaveEvent, 'mouseleave');
          }

          leaveEvent.target = leaveEvent.target.parent as IEventTarget;
        }

        this.freeEvent(leaveEvent);
      }

      this.freeEvent(outEvent);
    }

    if (outTarget !== e.target) {
      const overType = from.type === 'mousemove' ? 'mouseover' : 'pointerover';
      const overEvent = this.clonePointerEvent(e, overType);

      this.dispatchEvent(overEvent, 'pointerover');
      if (isMouse) {
        this.dispatchEvent(overEvent, 'mouseover');
      }

      let overTargetAncestor = outTarget?.parent;

      while (this.inputValid() && overTargetAncestor && overTargetAncestor !== this.rootTarget.parent) {
        if (overTargetAncestor === e.target) {
          break;
        }

        overTargetAncestor = overTargetAncestor.parent;
      }

      const didPointerEnter =
        this.inputValid() && (!overTargetAncestor || overTargetAncestor === this.rootTarget.parent);

      if (didPointerEnter) {
        const enterEvent = this.clonePointerEvent(e, 'pointerenter');

        enterEvent.eventPhase = enterEvent.AT_TARGET;

        let currentTarget = enterEvent.target;
        // 预先计算 outTarget 的所有祖先
        const outTargetAncestors = new Set<IEventTarget>();
        let ancestor = outTarget;
        while (ancestor && ancestor !== this.rootTarget) {
          outTargetAncestors.add(ancestor);
          ancestor = ancestor.parent;
        }

        while (
          this.inputValid() &&
          currentTarget &&
          currentTarget !== outTarget &&
          currentTarget !== this.rootTarget.parent
        ) {
          // 检查 currentTarget 是否是 outTarget 的祖先
          if (!outTargetAncestors.has(currentTarget)) {
            enterEvent.currentTarget = currentTarget;

            this.notifyTarget(enterEvent);
            if (isMouse) {
              this.notifyTarget(enterEvent, 'mouseenter');
            }
          }

          currentTarget = currentTarget.parent as IEventTarget;
        }

        this.freeEvent(enterEvent);
      }

      this.freeEvent(overEvent);
    }

    const propagationMethod = 'dispatchEvent';

    this[propagationMethod](e, 'pointermove');

    if (e.pointerType === 'touch') {
      this[propagationMethod](e, 'touchmove');
    }

    if (isMouse && this.inputValid()) {
      this[propagationMethod](e, 'mousemove');
      this.cursorTarget = e.target;
      this.cursor = (e.target?.attribute?.cursor as Cursor) || this.rootTarget.getCursor();
    }

    if (this.inputValid()) {
      trackingData.overTargets = e.composedPath();
    }

    this.freeEvent(e);
  };

  protected onPointerOver = (from: FederatedEvent, target: IEventTarget) => {
    if (!(from instanceof FederatedPointerEvent)) {
      Logger.getInstance().warn('EventManager cannot map a non-pointer event as a pointer event');

      return;
    }

    const trackingData = this.trackingData(from.pointerId);
    const e = this.createPointerEvent(from, from.type, target);
    const isMouse = isMouseLike(e.pointerType);

    this.dispatchEvent(e, 'pointerover');
    if (isMouse) {
      this.dispatchEvent(e, 'mouseover');
    }
    if (e.pointerType === 'mouse' && this.inputValid()) {
      this.cursorTarget = e.target;
      this.cursor = (e.target?.attribute?.cursor as Cursor) || this.rootTarget.getCursor();
    }

    const enterEvent = this.clonePointerEvent(e, 'pointerenter');

    enterEvent.eventPhase = enterEvent.AT_TARGET;

    while (this.inputValid() && enterEvent.target && enterEvent.target !== this.rootTarget.parent) {
      enterEvent.currentTarget = enterEvent.target;

      this.notifyTarget(enterEvent);
      if (isMouse) {
        this.notifyTarget(enterEvent, 'mouseenter');
      }

      enterEvent.target = enterEvent.target.parent as IEventTarget;
    }

    if (this.inputValid()) {
      trackingData.overTargets = e.composedPath();
    }

    this.freeEvent(e);
    this.freeEvent(enterEvent);
  };

  protected onPointerOut = (from: FederatedEvent, target: IEventTarget) => {
    if (!(from instanceof FederatedPointerEvent)) {
      Logger.getInstance().warn('EventManager cannot map a non-pointer event as a pointer event');

      return;
    }

    const trackingData = this.trackingData(from.pointerId);

    if (trackingData.overTargets) {
      const isMouse = isMouseLike(from.pointerType);
      const outTarget = this.findMountedTarget(trackingData.overTargets);

      const outEvent = this.createPointerEvent(from, 'pointerout', outTarget || undefined);

      this.dispatchEvent(outEvent);
      if (isMouse) {
        this.dispatchEvent(outEvent, 'mouseout');
      }

      const leaveEvent = this.createPointerEvent(from, 'pointerleave', outTarget || undefined);

      leaveEvent.eventPhase = leaveEvent.AT_TARGET;

      while (this.inputValid() && leaveEvent.target && leaveEvent.target !== this.rootTarget.parent) {
        leaveEvent.currentTarget = leaveEvent.target;

        this.notifyTarget(leaveEvent);
        if (isMouse) {
          this.notifyTarget(leaveEvent, 'mouseleave');
        }

        leaveEvent.target = leaveEvent.target.parent as IEventTarget;
      }

      trackingData.overTargets = [];

      this.freeEvent(outEvent);
      this.freeEvent(leaveEvent);
    }

    this.cursorTarget = null;
    this.cursor = '';
  };

  protected onPointerUp = (from: FederatedEvent, target: IEventTarget) => {
    if (!(from instanceof FederatedPointerEvent)) {
      Logger.getInstance().warn('EventManager cannot map a non-pointer event as a pointer event');

      return;
    }

    const now = clock.now();
    const e = this.createPointerEvent(from, from.type, target);

    const trackingData = this.trackingData(from.pointerId);
    trackingData.ending = trackingData.pressTargetsByButton[from.button];
    delete trackingData.pressTargetsByButton[from.button];
    this.dispatchEvent(e, 'pointerup');

    if (e.pointerType === 'touch') {
      this.dispatchEvent(e, 'touchend');
    } else if (isMouseLike(e.pointerType)) {
      const isRightButton = e.button === 2;

      this.dispatchEvent(e, isRightButton ? 'rightup' : 'mouseup');
    }

    const pressTarget = this.findMountedTarget(trackingData.ending);

    let clickTarget = pressTarget;

    if (pressTarget && !e.composedPath().includes(pressTarget)) {
      let currentTarget = pressTarget;

      while (currentTarget && !e.composedPath().includes(currentTarget)) {
        e.currentTarget = currentTarget;

        this.notifyTarget(e, 'pointerupoutside');

        if (e.pointerType === 'touch') {
          this.notifyTarget(e, 'touchendoutside');
        } else if (isMouseLike(e.pointerType)) {
          const isRightButton = e.button === 2;

          this.notifyTarget(e, isRightButton ? 'rightupoutside' : 'mouseupoutside');
        }

        currentTarget = currentTarget.parent as IEventTarget;
      }

      delete trackingData.pressTargetsByButton[from.button];

      clickTarget = currentTarget;
    }

    this.emitPointerInput(e, 'pointerup');
    if (clickTarget && this.inputValid()) {
      const clickEvent = this.clonePointerEvent(e, 'click');

      clickEvent.target = clickTarget;
      clickEvent.path = [];
      clickEvent.detailPath = [];

      if (!trackingData.clicksByButton[from.button]) {
        trackingData.clicksByButton[from.button] = {
          clickCount: 0,
          target: clickEvent.target,
          timeStamp: now
        };
      }

      const clickHistory = trackingData.clicksByButton[from.button];
      if (
        clickHistory.target === clickEvent.target &&
        now - clickHistory.timeStamp < (this._config.clickInterval ?? DEFAULT_CLICK_INTERVAL)
      ) {
        ++clickHistory.clickCount;
      } else {
        clickHistory.clickCount = 1;
      }

      clickHistory.target = clickEvent.target;
      clickHistory.timeStamp = now;

      clickEvent.detail = clickHistory.clickCount;

      if (isMouseLike(clickEvent.pointerType)) {
        this.dispatchEvent(clickEvent, 'click');
        this.emitInput(clickEvent, 'click');

        if (clickHistory.clickCount === 2) {
          // 双击
          this.dispatchEvent(clickEvent, 'dblclick');
          this.emitInput(clickEvent, 'dblclick');
        }
      } else if (clickEvent.pointerType === 'touch' && this._config.supportsTouchEvents) {
        this.dispatchEvent(clickEvent, 'tap');
        this.emitInput(clickEvent, 'tap');
        if (clickHistory.clickCount === 2) {
          // 双击
          this.dispatchEvent(clickEvent, 'dbltap');
          this.emitInput(clickEvent, 'dbltap');
        }
      }

      this.dispatchEvent(clickEvent, 'pointertap');
      this.emitInput(clickEvent, 'pointertap');

      this.freeEvent(clickEvent);
    }

    this.freeEvent(e);
  };

  protected onPointerUpOutside = (from: FederatedEvent, target: IEventTarget) => {
    if (!(from instanceof FederatedPointerEvent)) {
      Logger.getInstance().warn('EventManager cannot map a non-pointer event as a pointer event');

      return;
    }

    const trackingData = this.trackingData(from.pointerId);
    trackingData.ending = trackingData.pressTargetsByButton[from.button];
    delete trackingData.pressTargetsByButton[from.button];
    const pressTarget = this.findMountedTarget(trackingData.ending);
    const e = this.createPointerEvent(from, from.type, target);

    if (pressTarget) {
      let currentTarget = pressTarget;

      while (currentTarget) {
        e.currentTarget = currentTarget;

        this.notifyTarget(e, 'pointerupoutside');

        if (e.pointerType === 'touch') {
          this.notifyTarget(e, 'touchendoutside');
        } else if (isMouseLike(e.pointerType)) {
          this.notifyTarget(e, e.button === 2 ? 'rightupoutside' : 'mouseupoutside');
        }

        currentTarget = currentTarget.parent as IEventTarget;
      }

      delete trackingData.pressTargetsByButton[from.button];
    }

    this.emitPointerInput(e, 'pointerup');
    this.freeEvent(e);
  };

  protected onWheel = (from: FederatedEvent, target: IEventTarget) => {
    if (!(from instanceof FederatedWheelEvent)) {
      Logger.getInstance().warn('EventManager cannot map a non-wheel event as a wheel event');

      return;
    }

    const wheelEvent = this.createWheelEvent(from, target);

    this.dispatchEvent(wheelEvent);
    this.freeEvent(wheelEvent);
  };

  protected findMountedTarget(propagationPath: IEventTarget[] | null): IEventTarget | null {
    if (!propagationPath) {
      return null;
    }

    let currentTarget = propagationPath[0];

    for (let i = 1; i < propagationPath.length; i++) {
      if (propagationPath[i].parent === currentTarget) {
        currentTarget = propagationPath[i];
      } else {
        break;
      }
    }

    return currentTarget;
  }

  protected createPointerEvent(
    from: FederatedPointerEvent,
    type?: string,
    target?: IEventTarget
  ): FederatedPointerEvent {
    const event = this.allocateEvent(FederatedPointerEvent);

    this.copyPointerData(from, event);
    this.copyMouseData(from, event);
    this.copyData(from, event);

    event.nativeEvent = from.nativeEvent;
    event.originalEvent = from;

    if (target) {
      event.target = target;
    } else {
      event.target = this.pickTarget(event.viewX ?? event.global.x, event.viewY ?? event.global.y, event);
    }

    if (typeof type === 'string') {
      event.type = type;
    }

    return event;
  }

  protected createWheelEvent(from: FederatedWheelEvent, target?: IEventTarget): FederatedWheelEvent {
    const event = this.allocateEvent(FederatedWheelEvent);

    this.copyWheelData(from, event);
    this.copyMouseData(from, event);
    this.copyData(from, event);

    event.nativeEvent = from.nativeEvent;
    event.originalEvent = from;
    event.target = target || this.pickTarget(event.viewX ?? event.global.x, event.viewY ?? event.global.y, event);

    return event;
  }

  protected clonePointerEvent(from: FederatedPointerEvent, type?: string): FederatedPointerEvent {
    const event = this.allocateEvent(FederatedPointerEvent);

    event.nativeEvent = from.nativeEvent;
    event.originalEvent = from.originalEvent;

    this.copyPointerData(from, event);
    this.copyMouseData(from, event);
    this.copyData(from, event);

    event.target = from.target;
    event.path = from.composedPath().slice();
    const p = from.composedDetailPath();
    event.detailPath = p && p.slice();
    event.type = type ?? event.type;

    return event;
  }

  copyWheelData(from: FederatedWheelEvent, to: FederatedWheelEvent): void {
    to.deltaMode = from.deltaMode;
    to.deltaX = from.deltaX;
    to.deltaY = from.deltaY;
    to.deltaZ = from.deltaZ;
  }

  copyPointerData(from: FederatedEvent, to: FederatedEvent): void {
    if (!(from instanceof FederatedPointerEvent && to instanceof FederatedPointerEvent)) {
      return;
    }

    to.pointerId = from.pointerId;
    to.width = from.width;
    to.height = from.height;
    to.isPrimary = from.isPrimary;
    to.pointerType = from.pointerType;
    to.pressure = from.pressure;
    to.tangentialPressure = from.tangentialPressure;
    to.tiltX = from.tiltX;
    to.tiltY = from.tiltY;
    to.twist = from.twist;
  }

  copyMouseData(from: FederatedEvent, to: FederatedEvent): void {
    if (!(from instanceof FederatedMouseEvent && to instanceof FederatedMouseEvent)) {
      return;
    }

    to.altKey = from.altKey;
    to.button = from.button;
    to.buttons = from.buttons;
    to.ctrlKey = from.ctrlKey;
    to.shiftKey = from.shiftKey;
    to.metaKey = from.metaKey;

    ['client', 'movement', 'canvas', 'screen', 'global', 'offset', 'viewport'].forEach(key => {
      to[key].x = from[key].x;
      to[key].y = from[key].y;
    });
  }

  copyData(from: FederatedEvent, to: FederatedEvent): void {
    to.isTrusted = from.isTrusted;
    to.srcElement = from.srcElement;
    to.timeStamp = clock.now();
    to.type = from.type;
    to.detail = from.detail;
    to.view = from.view;
    to.which = from.which;

    to.layer.x = from.layer.x;
    to.layer.y = from.layer.y;

    to.page.x = from.page.x;
    to.page.y = from.page.y;

    (to as any).pickParams = (from as any).pickParams;
  }

  protected trackingData(id: number): TrackingData {
    if (!this.mappingState.trackingData[id]) {
      this.mappingState.trackingData[id] = {
        generation: 0,
        inside: false,
        previousInside: false,
        pressTargetsByButton: {},
        clicksByButton: {},
        overTarget: null
      };
    }

    return this.mappingState.trackingData[id];
  }

  protected allocateEvent<T extends FederatedEvent>(constructor: { new (boundary: EventManager): T }): T {
    if (!this.eventPool.has(constructor as any)) {
      this.eventPool.set(constructor as any, []);
    }

    const event = (this.eventPool.get(constructor as any)?.pop() as T) || new constructor(this);

    event.eventPhase = event.NONE;
    event.currentTarget = null;
    event.path = [];
    event.detailPath = [];
    event.target = null;

    return event;
  }

  protected freeEvent<T extends FederatedEvent>(event: T): void {
    event.nativeEvent = null;
    event.originalEvent = null;
    if (!this.rootTarget) {
      return;
    }
    if (event.manager !== this) {
      throw new Error('It is illegal to free an event not managed by this EventManager!');
    }

    const constructor = event.constructor;

    if (!this.eventPool.has(constructor as any)) {
      this.eventPool.get(constructor as any).forEach(e => {
        e.eventPhase = event.NONE;
        e.currentTarget = null;
        e.path = [];
        e.detailPath = [];
        e.target = null;
      });
      this.eventPool.set(constructor as any, []);
    }

    this.eventPool.get(constructor as any)?.push(event);
  }

  private notifyListeners(e: FederatedEvent, type: string): void {
    if (!this.inputValid() || !e.currentTarget) {
      return;
    }
    const events = (e.currentTarget as any)._events as EmitterListeners;
    const listeners = events[type];

    if (listeners) {
      if ('fn' in listeners) {
        if (listeners.once) {
          e.currentTarget.removeEventListener(type, listeners.fn, { once: true });
        }
        listeners.fn.call(listeners.context, e);
      } else {
        for (let i = 0, j = listeners.length; i < j && this.inputValid() && !e.propagationImmediatelyStopped; i++) {
          if (listeners[i].once) {
            e.currentTarget.removeEventListener(type, listeners[i].fn, { once: true });
          }
          listeners[i].fn.call(listeners[i].context, e);
        }
      }
    }
    // 永远触发WILDCARD事件代理
    if (this.inputValid()) {
      this.emitDelegation(e, type);
    }
  }

  private emitDelegation(e: FederatedEvent, type: string): void {
    if (!this.inputValid() || !e.currentTarget) {
      return;
    }
    const events = (e.currentTarget as any)._events as EmitterListeners;
    const listeners = events[WILDCARD];
    if (listeners) {
      if ('fn' in listeners) {
        listeners.fn.call(listeners.context, e, type);
      } else {
        for (let i = 0, j = listeners.length; i < j && this.inputValid() && !e.propagationImmediatelyStopped; i++) {
          listeners[i].fn.call(listeners[i].context, e, type);
        }
      }
    }
  }

  private pickTarget(x: number, y: number, e: any) {
    let target;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const pickResult = this.rootTarget.pick(x, y);
    if (pickResult && pickResult.graphic) {
      target = pickResult.graphic;
    } else if (pickResult && pickResult.group) {
      target = pickResult.group;
      // } else if (x >= 0 && x <= get(this.rootTarget, 'width') && y >= 0 && y <= get(this.rootTarget, 'height')) {
    } else if ((this.rootTarget as unknown as IGraphic).AABBBounds.contains(x, y)) {
      target = this.rootTarget;
    } else {
      target = null;
    }
    if (e) {
      e.pickParams = pickResult.params;
    }
    return target;
  }

  release() {
    this.dispatch.removeAllListeners();
    this.eventPool.clear();
    this.rootTarget = null;
    this.mappingTable = null;
    this.mappingState = { trackingData: {} };
    this.canvasInput.clear();
    this.windowInput.clear();
    this.dispatchingEvent?.stopImmediatePropagation();
    this.cursorTarget = null;
  }
}
