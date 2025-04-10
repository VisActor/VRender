import type { ITickHandler, ITicker } from '@visactor/vrender-core';
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
}

export class ManualTicker extends DefaultTicker implements ITicker {
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
}
