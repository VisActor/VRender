import { EventEmitter } from '@visactor/vutils';
import type { IStage, ITimeline } from '@visactor/vrender-core';
import { application, PerformanceRAF, type ITickHandler, type ITicker, STATUS } from '@visactor/vrender-core';

const performanceRAF = new PerformanceRAF();

class RAFTickHandler implements ITickHandler {
  protected released: boolean = false;

  tick(interval: number, cb: (handler: ITickHandler) => void | boolean): void {
    performanceRAF.addAnimationFrameCb(() => {
      if (this.released) {
        return;
      }
      return cb(this);
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
  protected interval: number;
  protected tickerHandler: ITickHandler;
  protected status: STATUS;
  protected lastFrameTime: number;
  protected tickCounts: number;
  protected stage: IStage;
  timelines: ITimeline[] = [];
  autoStop: boolean;
  // 随机扰动（每次都对interval进行随机的扰动，避免所有tick都发生在同一帧）
  protected _jitter: number;
  protected timeOffset: number;
  declare _lastTickTime: number;
  protected frameTimeHistory: number[] = [];

  constructor(stage?: IStage) {
    super();
    this.init();
    this.lastFrameTime = -1;
    this.tickCounts = 0;
    this.stage = stage;
    this.autoStop = true;
    this.interval = 16;
    this.computeTimeOffsetAndJitter();
  }

  bindStage(stage: IStage): void {
    this.stage = stage;
  }

  /**
   * 计算时间偏移和随机扰动
   */
  computeTimeOffsetAndJitter(): void {
    this.timeOffset = Math.floor(Math.random() * this.interval);
    this._jitter = Math.min(Math.max(this.interval * 0.2, 6), this.interval * 0.7);
  }

  init(): void {
    this.interval = 16;
    this.status = STATUS.INITIAL;
    application.global.hooks.onSetEnv.tap('graph-ticker', () => {
      this.initHandler(false);
    });
    if (application.global.env) {
      this.initHandler(false);
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

  protected initHandler(force: boolean = false) {
    this.setupTickHandler(force);
  }

  /**
   * Set up the tick handler
   * @returns true if setup was successful, false otherwise
   */
  protected setupTickHandler(force: boolean = false): boolean {
    if (!force && this.tickerHandler) {
      return true;
    }
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
    this.computeTimeOffsetAndJitter();
  }

  getInterval(): number {
    return this.interval;
  }

  setFPS(fps: number): void {
    this.setInterval(Math.floor(1000 / fps));
  }

  getFPS(): number {
    return 1000 / this.interval;
  }

  tick(interval: number): void {
    this.tickerHandler.tick(interval, (handler: ITickHandler) => {
      return this.handleTick(handler, { once: true });
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
    this.setupTickHandler(true);
    this.lastFrameTime = -1;
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
    this.lastFrameTime = -1;
  }

  protected checkSkip(delta: number): boolean {
    if (this.stage?.params?.optimize?.tickRenderMode === 'performance') {
      return false;
    }
    // 随机扰动（每次都对interval进行随机的扰动，避免所有tick都发生在同一帧）
    const skip = delta < this.interval + (Math.random() - 0.5) * 2 * this._jitter;
    return skip;
  }

  protected handleTick = (handler: ITickHandler, params?: { once?: boolean }): boolean => {
    const { once = false } = params ?? {};

    // 尝试停止
    if (this.ifCanStop()) {
      this.stop();
      return false;
    }

    const currentTime = handler.getTime();
    this._lastTickTime = currentTime;

    if (this.lastFrameTime < 0) {
      this.lastFrameTime = currentTime - this.interval + this.timeOffset;
      this.frameTimeHistory.push(this.lastFrameTime);
    }

    const delta = currentTime - this.lastFrameTime;

    const skip = this.checkSkip(delta);

    if (!skip) {
      this._handlerTick(delta);
      this.lastFrameTime = currentTime;
      this.frameTimeHistory.push(this.lastFrameTime);
    }

    if (!once) {
      handler.tick(this.interval, this.handleTick);
    }

    return !skip;
  };

  protected _handlerTick = (delta: number): void => {
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
