import type { IFederatedPointerEvent } from '@visactor/vrender-core';
import type { IPointLike } from '@visactor/vutils';

export type GestureDirection = 'none' | 'left' | 'right' | 'down' | 'up';

export interface GestureEvent extends IFederatedPointerEvent {
  points: IPointLike[];
  direction: GestureDirection;
  deltaX: number;
  deltaY: number;
  scale: number;
  center: IPointLike;
  velocity: number;
}

export interface GestureConfig {
  press?: {
    /**
     * @default 251
     * Minimal press time in ms.
     * @see http://hammerjs.github.io/recognizer-press/
     */
    time?: number;
    /**
     * @default 10
     * Maximal movement that is allowed while pressing.
     * @see http://hammerjs.github.io/recognizer-press/
     */
    threshold?: number;
  };
  swipe?: {
    /**
     * Minimal distance required before recognizing.
     * @default 10
     * @see https://hammerjs.github.io/recognizer-swipe/
     */
    threshold?: number;
    /**
     * Minimal velocity required before recognizing, unit is in px per ms.
     * @default 0.3
     * @see http://hammerjs.github.io/recognizer-swipe/
     */
    velocity?: number;
  };
  tap?: {
    /**
     * max time between the multi-tap taps
     * @default 300
     */
    interval?: number;
  };
}

export interface DefaultGestureConfig {
  press: {
    time: number;
    threshold: number;
  };
  swipe: {
    threshold: number;
    velocity: number;
  };
  tap: {
    interval: number;
  };
}

export interface EmitEventObject {
  type: string;
  ev: GestureEvent;
}
