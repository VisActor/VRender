import type { ITickHandler } from '../../interface/animate';

export class ManualTickHandler implements ITickHandler {
  protected timerId: number;
  protected time: number = 0;

  static Avaliable(): boolean {
    return true;
  }

  avaliable(): boolean {
    return ManualTickHandler.Avaliable();
  }

  tick(interval: number, cb: (handler: ITickHandler, params?: { once: boolean }) => void): void {
    this.time = Math.max(0, interval + this.time);
    cb(this, { once: true });
  }

  tickTo(t: number, cb: (handler: ITickHandler, params?: { once: boolean }) => void): void {
    this.time = Math.max(0, t);
    cb(this, { once: true });
  }

  release() {
    if (this.timerId > 0) {
      // clearTimeout(this.timerId);
      this.timerId = -1;
    }
  }

  getTime() {
    return this.time;
  }
}
