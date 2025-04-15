import type { IStage } from '@visactor/vrender-core';
import { STATUS, type ITickHandler, type ITicker } from '@visactor/vrender-core';
import { DefaultTicker } from './default-ticker';

class ManualTickHandler implements ITickHandler {
  protected released: boolean = false;
  protected startTime: number = -1;
  protected currentTime: number = -1;

  tick(interval: number, cb: (handler: ITickHandler) => void): void {
    if (this.startTime < 0) {
      this.startTime = 0;
    }
    this.currentTime = this.startTime + interval;
    cb(this);
  }

  release(): void {
    this.released = true;
  }

  getTime(): number {
    return this.currentTime;
  }

  tickTo(time: number, cb: (handler: ITickHandler) => void): void {
    if (this.startTime < 0) {
      this.startTime = 0;
      this.currentTime = 0;
    }
    const interval = time - this.currentTime;
    this.tick(interval, cb);
  }
}

export class ManualTicker extends DefaultTicker implements ITicker {
  constructor(stage: IStage) {
    super(stage);
    // manualTicker 的 lastFrameTime 默认为 0
    // status 默认为 STATUS.RUNNING（不需要启动）
    this.lastFrameTime = 0;
    this.status = STATUS.RUNNING;
  }
  protected setupTickHandler(): boolean {
    const handler: ITickHandler = new ManualTickHandler();

    // Destroy the previous tick handler
    if (this.tickerHandler) {
      this.tickerHandler.release();
    }

    this.tickerHandler = handler;
    return true;
  }

  getTime(): number {
    return this.tickerHandler.getTime();
  }

  tickAt(time: number): void {
    this.tickTo(time);
  }

  start(force = false) {
    if (this.status === STATUS.RUNNING) {
      return false;
    }
    if (!this.tickerHandler) {
      return false;
    }
    if (!force) {
      if (this.status === STATUS.PAUSE) {
        return false;
      }
      if (this.ifCanStop()) {
        return false;
      }
    }
    this.status = STATUS.RUNNING;
    return true;
  }
}
