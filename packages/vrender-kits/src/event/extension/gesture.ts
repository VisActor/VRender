import { application, clock, WILDCARD } from '@visactor/vrender-core';
import type { IEventTarget, IFederatedPointerEvent, FederatedPointerEvent, INode } from '@visactor/vrender-core';
import type { IPointLike } from '@visactor/vutils';
import { EventEmitter } from '@visactor/vutils';

import type { DefaultGestureConfig, EmitEventObject, GestureConfig, GestureDirection, GestureEvent } from './interface';

/**
 * 代码参考 https://github.com/hammerjs/hammer.js
 * The MIT License (MIT)

  Copyright (C) 2011-2017 by Jorik Tangelder (Eight Media)

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

const PRESS_TIME = 251;
const PRESS_THRESHOLD = 9;
const SWIPE_VELOCITY = 0.3;
const SWIPE_THRESHOLD = 10;
const TAP_INTERVAL = 300;

const calcDirection = (start: IPointLike, end: IPointLike) => {
  const xDistance = end.x - start.x;
  const yDistance = end.y - start.y;
  if (Math.abs(xDistance) > Math.abs(yDistance)) {
    return xDistance > 0 ? 'right' : 'left';
  }
  return yDistance > 0 ? 'down' : 'up';
};

// 计算2点之间的距离
const calcDistance = (point1: IPointLike, point2: IPointLike) => {
  const xDistance = Math.abs(point2.x - point1.x);
  const yDistance = Math.abs(point2.y - point1.y);
  return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
};

const getCenter = (points: IPointLike[]) => {
  const pointersLength = points.length;

  if (pointersLength === 1) {
    return {
      x: Math.round(points[0].x),
      y: Math.round(points[0].y)
    };
  }

  let x = 0;
  let y = 0;
  let i = 0;
  while (i < pointersLength) {
    x += points[i].x;
    y += points[i].y;
    i++;
  }

  return {
    x: Math.round(x / pointersLength),
    y: Math.round(y / pointersLength)
  };
};

export class Gesture extends EventEmitter {
  element: INode | null;

  private cachedEvents: IFederatedPointerEvent[] = [];
  private startTime: number;
  // @ts-ignore
  // eslint-disable-next-line no-undef
  private pressTimeout: NodeJS.Timeout | null;
  private startPoints: IPointLike[] = [];
  // 用来记录当前触发的事件
  private processEvent: Record<string, boolean> = {};
  private startDistance: number;
  private center: IPointLike;
  private eventType: string | null;
  private direction: GestureDirection | null;

  private lastMoveTime: number;
  private prevMoveTime: number;

  private prevMovePoint: IPointLike | null;
  private lastMovePoint: IPointLike | null;

  private throttleTimer: number = 0;
  private emitThrottles: EmitEventObject[] = [];

  private config: DefaultGestureConfig;

  private tapCount;
  private lastTapTime;
  private lastTapTarget: IEventTarget | null = null;

  constructor(element: IEventTarget, config: GestureConfig = {}) {
    super();
    this.element = element;
    this.tapCount = 0;
    this.lastTapTime = 0;
    this.config = {
      press: {
        time: config?.press?.time ?? PRESS_TIME,
        threshold: config?.press?.threshold ?? PRESS_THRESHOLD
      },
      swipe: {
        threshold: config?.swipe?.threshold ?? SWIPE_THRESHOLD,
        velocity: config?.swipe?.velocity ?? SWIPE_VELOCITY
      },
      tap: {
        interval: config?.tap?.interval ?? TAP_INTERVAL
      }
    };
    this.initEvents();
  }

  initEvents() {
    const { element } = this;
    if (!element) {
      return;
    }

    element.addEventListener('pointerdown', this.onStart);
    element.addEventListener('pointermove', this.onMove);
    element.addEventListener('pointerup', this.onEnd);
    element.addEventListener('pointerupoutside', this.onEnd);
  }

  removeEvents() {
    const { element } = this;
    if (!element) {
      return;
    }
    element.removeEventListener('pointerdown', this.onStart);
    element.removeEventListener('pointermove', this.onMove);
    element.removeEventListener('pointerup', this.onEnd);
    element.removeEventListener('pointerupoutside', this.onEnd);
  }

  release() {
    this.removeEvents();
    this.element = null;
  }

  private onStart = (ev?: FederatedPointerEvent) => {
    this.cachedEvents = [];
    this.startPoints = [];
    this.reset();

    this.startTime = clock.now();

    const { cachedEvents, startPoints } = this;

    if (ev) {
      cachedEvents.push(ev.clone());
    }
    // 重置 startPoints
    startPoints.length = cachedEvents.length;
    for (let i = 0; i < cachedEvents.length; i++) {
      const { x, y } = cachedEvents[i];
      const point = { x, y };
      startPoints[i] = point;
    }

    if (startPoints.length === 1) {
      const event = cachedEvents[0] as unknown as GestureEvent;
      this.pressTimeout = setTimeout(() => {
        const eventType = 'press';
        const direction = 'none';
        event.direction = direction;
        event.deltaX = 0;
        event.deltaY = 0;
        event.points = startPoints;
        this.triggerStartEvent(eventType, event);
        this.triggerEvent(eventType, event);
        this.eventType = eventType;
        this.direction = direction;
        this.pressTimeout = null;
      }, this.config.press.time);
      return;
    }

    this.startDistance = calcDistance(startPoints[0], startPoints[1]);
    this.center = getCenter([startPoints[0], startPoints[1]]);
  };

  private onMove = (ev: FederatedPointerEvent) => {
    this.clearPressTimeout();
    const { startPoints, cachedEvents } = this;
    if (!startPoints.length) {
      return;
    }

    const moveEvent = ev.clone() as unknown as GestureEvent;
    const { x, y, pointerId } = moveEvent;
    for (let i = 0, len = cachedEvents.length; i < len; i++) {
      if (pointerId === cachedEvents[i].pointerId) {
        cachedEvents[i] = moveEvent;
        break;
      }
    }
    const point = { x, y };
    const points = cachedEvents.map(cachedEvent => ({ x: cachedEvent.x, y: cachedEvent.y }));

    const now = clock.now();
    this.prevMoveTime = this.lastMoveTime;
    this.prevMovePoint = this.lastMovePoint;
    this.lastMoveTime = now;
    this.lastMovePoint = point;

    if (startPoints.length === 1) {
      const startPoint = startPoints[0];
      const deltaX = x - startPoint.x;
      const deltaY = y - startPoint.y;
      const direction = this.direction || calcDirection(startPoint, point);
      this.direction = direction;

      const eventType = this.getEventType(point);
      moveEvent.direction = direction;
      moveEvent.deltaX = deltaX;
      moveEvent.deltaY = deltaY;
      moveEvent.points = points;
      this.triggerStartEvent(eventType, moveEvent);
      this.triggerEvent(eventType, moveEvent);
      return;
    }

    const { startDistance } = this;
    const currentDistance = calcDistance(points[0], points[1]);

    // 缩放比例
    moveEvent.scale = currentDistance / startDistance;
    moveEvent.center = this.center;
    moveEvent.points = points;
    this.triggerStartEvent('pinch', moveEvent);
    this.triggerEvent('pinch', moveEvent);
  };

  private onEnd = (ev: FederatedPointerEvent) => {
    const endEvent = ev.clone() as unknown as GestureEvent;
    const { cachedEvents, startPoints } = this;
    const points = cachedEvents.map(ev => {
      return { x: ev.x, y: ev.y };
    });
    endEvent.points = points;
    this.triggerEndEvent(endEvent);

    if (cachedEvents.length === 1) {
      const now = clock.now();
      const lastMoveTime = this.lastMoveTime;
      // 做这个判断是为了最后一次touchmove后到end前，是否还有一个停顿的过程
      // 100 是拍的一个值，理论这个值会很短，一般不卡顿的话在10ms以内
      if (now - lastMoveTime < 100) {
        const prevMoveTime = this.prevMoveTime || this.startTime;
        const intervalTime = lastMoveTime - prevMoveTime;
        // 时间间隔一定要大于0, 否则计算没意义
        if (intervalTime > 0) {
          const prevMovePoint = this.prevMovePoint || startPoints[0];
          const lastMovePoint = this.lastMovePoint || startPoints[0];
          const distance = calcDistance(prevMovePoint, lastMovePoint);
          // move速率
          const velocity = distance / intervalTime;
          // 0.3 是参考hammerjs的设置
          if (velocity > this.config.swipe.velocity && distance > this.config.swipe.threshold) {
            endEvent.velocity = velocity;
            endEvent.direction = calcDirection(prevMovePoint, lastMovePoint);
            this.triggerEvent('swipe', endEvent);

            this.cachedEvents = [];
            this.startPoints = [];
            this.reset();
            return;
          }
        }
      }

      if (now - this.startTime < this.config.press.time) {
        if (now - this.lastTapTime < this.config.tap.interval && ev.target === this.lastTapTarget) {
          this.tapCount++;
        } else {
          this.tapCount = 1;
        }
        this.lastTapTime = now;
        this.lastTapTarget = ev.target;

        if (this.tapCount === 1) {
          this.triggerEvent('tap', endEvent);
        } else if (this.tapCount === 2) {
          this.triggerEvent('doubletap', endEvent);
          this.tapCount = 0; // reset tapCount after doubletap
        }
      }
    }

    for (let i = 0, len = cachedEvents.length; i < len; i++) {
      if (cachedEvents[i].pointerId === endEvent.pointerId) {
        cachedEvents.splice(i, 1);
        startPoints.splice(i, 1);
        break;
      }
    }

    this.reset();

    // 多指离开 1 指后，重新触发一次start
    if (cachedEvents.length > 0) {
      this.onStart();
    }
  };

  private getEventType(point: IPointLike) {
    const { eventType, startTime, startPoints } = this;
    if (eventType === 'press') {
      return eventType;
    }

    let type;
    const now = clock.now();
    if (now - startTime > this.config.press.time && calcDistance(startPoints[0], point) < this.config.press.threshold) {
      type = 'press';
    } else {
      type = 'pan';
    }
    this.eventType = type;
    return type;
  }

  private enable(eventType: string) {
    this.processEvent[eventType] = true;
  }

  // 是否进行中的事件
  private isProcess(eventType: string) {
    return this.processEvent[eventType];
  }

  private pushEvent(type: string, ev: GestureEvent) {
    const { emitThrottles } = this;
    const newEvent = { type, ev };
    for (let i = 0, len = emitThrottles.length; i < len; i++) {
      if (emitThrottles[i].type === type) {
        emitThrottles.splice(i, 1, newEvent);
        return;
      }
    }
    emitThrottles.push(newEvent);
  }

  private clearPressTimeout() {
    if (this.pressTimeout) {
      clearTimeout(this.pressTimeout);
      this.pressTimeout = null;
    }
  }

  private reset() {
    this.clearPressTimeout();
    this.startTime = 0;
    this.startDistance = 0;
    this.direction = null;
    this.eventType = null;
    this.prevMoveTime = 0;
    this.prevMovePoint = null;
    this.lastMoveTime = 0;
    this.lastMovePoint = null;
  }

  private triggerEvent(type: string, ev: GestureEvent) {
    // 主要是节流处理
    this.pushEvent(type, ev);
    const { throttleTimer, emitThrottles } = this;
    if (throttleTimer) {
      return;
    }

    this.throttleTimer = application.global.getRequestAnimationFrame()(() => {
      application.global.getCancelAnimationFrame()(this.throttleTimer);
      this.throttleTimer = null;

      for (let i = 0, len = emitThrottles.length; i < len; i++) {
        const { type, ev } = emitThrottles[i];
        this.emitEvent(type, ev);
      }
      // 清空
      this.emitThrottles.length = 0;
    });
  }

  // 触发start事件
  private triggerStartEvent(type: string, ev: GestureEvent) {
    if (this.isProcess(type)) {
      return;
    }
    this.enable(type);
    this.triggerEvent(`${type}start`, ev);
  }

  private triggerEndEvent(ev: GestureEvent) {
    const processEvent = this.processEvent;
    Object.keys(processEvent).forEach(type => {
      this.triggerEvent(`${type}end`, ev);
      if (type === 'press') {
        // pressend 别名，pressup
        this.triggerEvent(`${type}up`, ev);
      }
      delete processEvent[type];
    });
  }

  private emitEvent(type: string, e: GestureEvent) {
    if (!this.element) {
      return;
    }
    const events = (this.element as unknown as any)._events;
    const listeners = events[WILDCARD];
    if (listeners) {
      if ('fn' in listeners) {
        listeners.fn.call(listeners.context, e, type);
      } else {
        for (let i = 0, j = listeners.length; i < j && !e.propagationImmediatelyStopped; i++) {
          listeners[i].fn.call(listeners[i].context, e, type);
        }
      }
    }

    this.emit(type, e);
  }
}
