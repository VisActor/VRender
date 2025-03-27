import { vglobal } from '../modules';

/**
 * 性能优化，将requestAnimationFrame的回调函数存储起来，在下一帧执行
 */
export class PerformanceRAF {
  nextAnimationFrameCbs: FrameRequestCallback[] = [];
  private _rafHandle: number | null = null;

  addAnimationFrameCb(callback: FrameRequestCallback) {
    this.nextAnimationFrameCbs.push(callback);
    // 下一帧执行nextAnimationFrameCbs
    this.tryRunAnimationFrameNextFrame();
    return this.nextAnimationFrameCbs.length - 1;
  }

  removeAnimationFrameCb(index: number): boolean {
    if (index >= 0 && index < this.nextAnimationFrameCbs.length) {
      // Set to null instead of empty function to avoid linter error
      this.nextAnimationFrameCbs[index] = null;
      return true;
    }
    return false;
  }

  protected runAnimationFrame = (time: number) => {
    this._rafHandle = null;
    const cbs = this.nextAnimationFrameCbs;
    this.nextAnimationFrameCbs = [];
    for (let i = 0; i < cbs.length; i++) {
      if (cbs[i]) {
        cbs[i](time);
      }
    }
  };

  protected tryRunAnimationFrameNextFrame = () => {
    if (this._rafHandle !== null || this.nextAnimationFrameCbs.length === 0) {
      return;
    }
    this._rafHandle = vglobal.getRequestAnimationFrame()(this.runAnimationFrame);
  };
}
