import type { ITickHandler } from '../../interface/animate';

export class TimeOutTickHandler implements ITickHandler {
  protected timerId: number;

  static Avaliable(): boolean {
    return true;
  }

  avaliable(): boolean {
    return TimeOutTickHandler.Avaliable();
  }

  tick(interval: number, cb: (handler: ITickHandler) => void): void {
    this.timerId = setTimeout(() => {
      cb(this);
    }, interval) as unknown as number;
  }

  release() {
    if (this.timerId > 0) {
      clearTimeout(this.timerId);
      this.timerId = -1;
    }
  }
  getTime() {
    return Date.now();
  }
}
