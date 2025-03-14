import { EventEmitter } from '@visactor/vutils';
import type { IStage } from '@visactor/vrender-core';
import { application, PerformanceRAF } from '@visactor/vrender-core';
import { type ITickHandler, type ITicker, STATUS } from '../intreface/ticker';
import type { ITimeline } from '../intreface/timeline';

const performanceRAF = new PerformanceRAF();

class RAFTickHandler implements ITickHandler {
  protected released: boolean = false;

  tick(interval: number, cb: (handler: ITickHandler) => void): void {
    performanceRAF.addAnimationFrameCb(() => {
      if (this.released) {
        return;
      }
      cb(this);
    });
  }

  release(): void {
    this.released = true;
  }

  getTime(): number {
    return Date.now();
  }
}

/**
 * Graph-based Ticker implementation
 * This ticker works directly with GraphManager instances without needing timeline adapters
 */
export class DefaultTicker extends EventEmitter implements ITicker {
  protected interval: number = 16;
  protected tickerHandler: ITickHandler;
  protected status: STATUS;
  protected lastFrameTime: number = -1;
  protected lastExecutionTime: number = -1; // Track the last time we actually executed a frame
  protected tickCounts: number = 0;
  protected stage: IStage;
  timelines: ITimeline[] = [];
  autoStop: boolean = true;

  constructor(stage: IStage) {
    super();
    this.init();
    this.lastFrameTime = -1;
    this.lastExecutionTime = -1;
    this.tickCounts = 0;
    this.stage = stage;
    this.autoStop = true;
  }

  init(): void {
    this.interval = 16;
    this.status = STATUS.INITIAL;
    application.global.hooks.onSetEnv.tap('graph-ticker', () => {
      this.initHandler();
    });
    if (application.global.env) {
      this.initHandler();
    }
  }

  addTimeline(timeline: ITimeline): void {
    this.timelines.push(timeline);
  }

  remTimeline(timeline: ITimeline): void {
    this.timelines = this.timelines.filter(t => t !== timeline);
  }

  getTimelines(): ITimeline[] {
    return this.timelines;
  }

  protected initHandler() {
    this.setupTickHandler();
  }

  /**
   * Set up the tick handler
   * @returns true if setup was successful, false otherwise
   */
  protected setupTickHandler(): boolean {
    const handler: ITickHandler = new RAFTickHandler();

    // Destroy the previous tick handler
    if (this.tickerHandler) {
      this.tickerHandler.release();
    }

    this.tickerHandler = handler;
    return true;
  }

  setInterval(interval: number): void {
    this.interval = interval;
  }

  getInterval(): number {
    return this.interval;
  }

  setFPS(fps: number): void {
    this.setInterval(1000 / fps);
  }

  getFPS(): number {
    return 1000 / this.interval;
  }

  tick(interval: number): void {
    this.tickerHandler.tick(interval, (handler: ITickHandler) => {
      this.handleTick(handler, { once: true });
    });
  }

  tickTo(t: number): void {
    if (!this.tickerHandler.tickTo) {
      return;
    }
    this.tickerHandler.tickTo(t, (handler: ITickHandler) => {
      this.handleTick(handler, { once: true });
    });
  }

  pause(): boolean {
    if (this.status === STATUS.INITIAL) {
      return false;
    }
    this.status = STATUS.PAUSE;
    return true;
  }

  resume(): boolean {
    if (this.status === STATUS.INITIAL) {
      return false;
    }
    this.status = STATUS.RUNNING;
    return true;
  }

  ifCanStop(): boolean {
    if (this.autoStop) {
      if (!this.timelines.length) {
        return true;
      }
      if (this.timelines.every(timeline => !timeline.isRunning())) {
        return true;
      }
    }
    return false;
  }

  start(force: boolean = false): boolean {
    if (this.status === STATUS.RUNNING) {
      return false;
    }
    if (!this.tickerHandler) {
      return false;
    }

    // 暂停中、或者应该停止的时候，就不执行
    if (!force) {
      if (this.status === STATUS.PAUSE) {
        return false;
      }
      if (this.ifCanStop()) {
        return false;
      }
    }

    this.status = STATUS.RUNNING;
    this.tickerHandler.tick(0, this.handleTick);
    return true;
  }

  stop(): void {
    // Reset the tick handler
    this.status = STATUS.INITIAL;
    this.setupTickHandler();
    this.lastFrameTime = -1;
    this.lastExecutionTime = -1;
  }

  /**
   * 用于自动启动或停止
   * 基于当前的graph managers检查是否需要启动或停止
   */
  trySyncTickStatus(): void {
    if (this.status === STATUS.INITIAL && this.timelines.some(timeline => timeline.isRunning())) {
      this.start();
    } else if (this.status === STATUS.RUNNING && this.timelines.every(timeline => !timeline.isRunning())) {
      this.stop();
    }
  }

  release(): void {
    this.stop();
    this.timelines = [];
    this.tickerHandler?.release();
    this.tickerHandler = null;
    this.lastExecutionTime = -1;
  }

  protected handleTick = (handler: ITickHandler, params?: { once?: boolean }): void => {
    const { once = false } = params ?? {};

    // 尝试停止
    if (this.ifCanStop()) {
      this.stop();
      return;
    }

    const currentTime = handler.getTime();

    // Check if enough time has passed since last execution based on the interval (FPS limit)
    const timeFromLastExecution = this.lastExecutionTime < 0 ? this.interval : currentTime - this.lastExecutionTime;

    // Only execute the frame if enough time has passed according to our interval/FPS setting
    if (timeFromLastExecution >= this.interval) {
      this._handlerTick();
      this.lastExecutionTime = currentTime;
    }

    if (!once) {
      handler.tick(this.interval, this.handleTick);
    }
  };

  protected _handlerTick = (): void => {
    // Specific execution function
    const tickerHandler = this.tickerHandler;
    const time = tickerHandler.getTime();

    // Time passed since last frame
    let delta = 0;
    if (this.lastFrameTime >= 0) {
      delta = time - this.lastFrameTime;
    }
    this.lastFrameTime = time;

    if (this.status !== STATUS.RUNNING) {
      return;
    }

    this.tickCounts++;

    // Update all graph managers
    this.timelines.forEach(timeline => {
      timeline.tick(delta);
    });

    this.emit('tick', delta);
  };
}
