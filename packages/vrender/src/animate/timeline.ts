import { AnimateStatus, Generator } from '../common';
import { IAnimate } from '../interface';

export interface ITimeline {
  id: number;
  animateCount: number;
  addAnimate: (animate: IAnimate) => void;
  removeAnimate: (animate: IAnimate) => void;
  tick: (delta: number) => void;
  clear: () => void;
  pause: () => void;
  resume: () => void;
}

// 管理一组动画
export class DefaultTimeline implements ITimeline {
  declare id: number;
  protected declare animateHead: IAnimate | null;
  protected declare animateTail: IAnimate | null;
  protected declare ticker: any;
  declare animateCount: number;
  protected declare paused: boolean;

  constructor() {
    this.id = Generator.GenAutoIncrementId();
    this.animateHead = null;
    this.animateTail = null;
    this.animateCount = 0;
    this.paused = false;
  }

  addAnimate(animate: IAnimate) {
    if (!this.animateTail) {
      this.animateHead = animate;
      this.animateTail = animate;
    } else {
      this.animateTail.nextAnimate = animate;
      animate.prevAnimate = this.animateTail;
      this.animateTail = animate;
      animate.nextAnimate = null;
    }
    this.animateCount++;
  }

  pause() {
    this.paused = true;
  }
  resume() {
    this.paused = false;
  }

  tick(delta: number) {
    if (this.paused) {
      return;
    }
    let animate = this.animateHead;
    this.animateCount = 0;
    while (animate) {
      if (animate.status === AnimateStatus.END) {
        this.removeAnimate(animate);
      } else if (animate.status === AnimateStatus.RUNNING || animate.status === AnimateStatus.INITIAL) {
        this.animateCount++;
        animate.advance(delta);
      } else if (animate.status === AnimateStatus.PAUSED) {
        // 暂停
        this.animateCount++;
      }
      animate = animate.nextAnimate;
    }
  }

  clear() {
    let animate = this.animateHead;
    while (animate) {
      animate.release();
      animate = animate.nextAnimate;
    }
    this.animateHead = null;
    this.animateTail = null;
    this.animateCount = 0;
  }

  removeAnimate(animate: IAnimate) {
    animate._onRemove && animate._onRemove.forEach(cb => cb());
    if (animate === this.animateHead) {
      this.animateHead = animate.nextAnimate;
      if (animate === this.animateTail) {
        // 只有一个元素
        this.animateTail = null;
      } else {
        // 有多个元素
        this.animateHead.prevAnimate = null;
      }
    } else if (animate === this.animateTail) {
      // 有多个元素
      this.animateTail = animate.prevAnimate;
      this.animateTail.nextAnimate = null;
      // animate.prevAnimate = null;
    } else {
      animate.prevAnimate.nextAnimate = animate.nextAnimate;
      animate.nextAnimate.prevAnimate = animate.prevAnimate;
      // animate不支持二次复用，不需要重置
      // animate.prevAnimate = null;
      // animate.nextAnimate = null;
    }
    animate.release();

    return;
  }
}

export const defaultTimeline = new DefaultTimeline();
