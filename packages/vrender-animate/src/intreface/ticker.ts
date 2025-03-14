/**
 * Ticker Types for Animation Graph
 */

import type { EventEmitter } from '@visactor/vutils';
import type { ITimeline } from './timeline';

export type TickerMode = 'raf' | 'timeout' | 'manual';

export enum STATUS {
  INITIAL = 0, // initial represents initial state
  RUNNING = 1, // running represents executing
  PAUSE = 2 // PAUSE represents tick continues but functions are not executed
}

export interface ITickHandler {
  /**
   * Start executing tick
   * @param interval Delay in ms
   * @param cb Callback to execute
   */
  tick: (interval: number, cb: (handler: ITickHandler) => void) => void;
  tickTo?: (t: number, cb: (handler: ITickHandler, params?: { once: boolean }) => void) => void;
  getTime: () => number; // Get current time
  release: () => void;
}

export interface ITickerHandlerStatic {
  new (): ITickHandler;
}

export interface ITicker extends EventEmitter {
  setFPS?: (fps: number) => void;
  setInterval?: (interval: number) => void;
  getFPS?: () => number;
  getInterval?: () => number;
  tick: (interval: number) => void;
  tickAt?: (time: number) => void;
  pause: () => boolean;
  resume: () => boolean;
  /**
   * Start ticking, if force is true, start regardless;
   * otherwise, don't start if timeline is empty
   */
  start: (force?: boolean) => boolean;
  stop: () => void;
  addTimeline: (timeline: ITimeline) => void;
  remTimeline: (timeline: ITimeline) => void;
  trySyncTickStatus: () => void;
  getTimelines: () => ITimeline[];
  release: () => void;

  // Whether to automatically stop, default is true
  autoStop: boolean;
}
