import { vglobal } from '../modules';

/**
 * 性能优化，将requestAnimationFrame的回调函数存储起来，在下一帧执行
 */
export class PerformanceRAF {
  nextAnimationFrameCbs: FrameRequestCallback[] = [];

  addAnimationFrameCb(callback: FrameRequestCallback) {
    this.nextAnimationFrameCbs.push(callback);
    // 下一帧执行nextAnimationFrameCbs
    this.tryRunAnimationFrameNextFrame();
    return this.nextAnimationFrameCbs.length - 1;
  }

  protected runAnimationFrame = (time: number) => {
    const cbs = this.nextAnimationFrameCbs;
    this.nextAnimationFrameCbs = [];
    for (let i = 0; i < cbs.length; i++) {
      cbs[i](time);
    }
  };

  protected tryRunAnimationFrameNextFrame = () => {
    if (!(this.nextAnimationFrameCbs && this.nextAnimationFrameCbs.length === 1)) {
      return;
    }
    vglobal.getRequestAnimationFrame()(this.runAnimationFrame);
  };
}
