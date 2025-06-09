import { application } from '../application';

let idx = 0;

/**
 * 性能优化，将requestAnimationFrame的回调函数存储起来，在下一帧执行
 */
export class PerformanceRAF {
  nextAnimationFrameCbs: Map<number, FrameRequestCallback> = new Map();
  private _rafHandle: number | null = null;

  addAnimationFrameCb(callback: FrameRequestCallback) {
    this.nextAnimationFrameCbs.set(++idx, callback);
    // 下一帧执行nextAnimationFrameCbs
    this.tryRunAnimationFrameNextFrame();
    return idx;
  }

  /**
   * 移除指定索引的回调函数
   * @param index raf索引，从1开始，相当于内部nextAnimationFrameCbs的idx + 1
   * @returns 是否移除成功
   */
  removeAnimationFrameCb(index: number): boolean {
    if (this.nextAnimationFrameCbs.has(index)) {
      this.nextAnimationFrameCbs.delete(index);
      return true;
    }
    return false;
  }

  protected runAnimationFrame = (time: number) => {
    this._rafHandle = null;
    const cbs = this.nextAnimationFrameCbs;
    this.nextAnimationFrameCbs = new Map();
    cbs.forEach(cb => cb(time));
  };

  protected tryRunAnimationFrameNextFrame = () => {
    if (this._rafHandle !== null || this.nextAnimationFrameCbs.size === 0) {
      return;
    }
    this._rafHandle = application.global.getRequestAnimationFrame()(this.runAnimationFrame);
  };
}
