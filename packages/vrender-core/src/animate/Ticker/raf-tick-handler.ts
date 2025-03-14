import { application } from '../../application';
import type { ITickHandler } from '../../interface/animate';

export class RAFTickHandler implements ITickHandler {
  protected released: boolean;

  static Avaliable(): boolean {
    return !!application.global.getRequestAnimationFrame();
  }
  avaliable(): boolean {
    return RAFTickHandler.Avaliable();
  }

  tick(interval: number, cb: (handler: ITickHandler) => void): void {
    const raf = application.global.getRequestAnimationFrame();
    raf(() => {
      if (this.released) {
        return;
      }
      cb(this);
    });
  }

  release() {
    this.released = true;
  }
  getTime() {
    return Date.now();
  }
}
