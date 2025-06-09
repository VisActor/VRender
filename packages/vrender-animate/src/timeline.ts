import { Generator, type IAnimate, type ITimeline, AnimateStatus } from '@visactor/vrender-core';
import { EventEmitter } from '@visactor/vutils';

// 定义链表节点
interface AnimateNode {
  animate: IAnimate;
  next: AnimateNode | null;
  prev: AnimateNode | null;
}

export class DefaultTimeline extends EventEmitter implements ITimeline {
  declare id: number;
  protected head: AnimateNode | null = null;
  protected tail: AnimateNode | null = null;
  protected animateMap: Map<IAnimate, AnimateNode> = new Map();
  protected _animateCount: number = 0;
  protected declare paused: boolean;

  // 添加必要的属性
  protected _playSpeed: number = 1;
  protected _totalDuration: number = 0;
  protected _startTime: number = 0;
  protected _currentTime: number = 0;

  declare isGlobal?: boolean;

  get animateCount() {
    return this._animateCount;
  }

  constructor() {
    super();
    this.id = Generator.GenAutoIncrementId();
    this.paused = false;
  }

  isRunning() {
    return !this.paused && this._animateCount > 0;
  }

  forEachAccessAnimate(cb: (animate: IAnimate, index: number) => void) {
    let current = this.head;
    let index = 0;

    while (current) {
      // 保存下一个节点的引用，以防在回调中移除当前节点
      const next = current.next;
      cb(current.animate, index);
      index++;
      current = next;
    }
  }

  addAnimate(animate: IAnimate) {
    const newNode: AnimateNode = {
      animate,
      next: null,
      prev: null
    };

    // 添加到链表尾部
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      if (this.tail) {
        this.tail.next = newNode;
        newNode.prev = this.tail;
        this.tail = newNode;
      }
    }

    // 在映射中保存节点引用
    this.animateMap.set(animate, newNode);
    this._animateCount++;

    // 更新总时长
    this._totalDuration = Math.max(this._totalDuration, animate.getStartTime() + animate.getDuration());
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

    // 应用播放速度
    const scaledDelta = delta * this._playSpeed;

    // 更新当前时间
    this._currentTime += scaledDelta;

    this.forEachAccessAnimate((animate, i) => {
      if (animate.status === AnimateStatus.END) {
        this.removeAnimate(animate, true);
      } else if (animate.status === AnimateStatus.RUNNING || animate.status === AnimateStatus.INITIAL) {
        animate.advance(scaledDelta);
      }
    });

    if (this._animateCount === 0) {
      this.emit('animationEnd');
    }
  }

  clear() {
    this.forEachAccessAnimate(animate => {
      animate.release();
    });

    this.head = null;
    this.tail = null;
    this.animateMap.clear();
    this._animateCount = 0;
    this._totalDuration = 0;
  }

  removeAnimate(animate: IAnimate, release: boolean = true) {
    const node = this.animateMap.get(animate);

    if (!node) {
      return;
    }

    if (release) {
      animate._onRemove && animate._onRemove.forEach(cb => cb());
      animate.release();
    }

    // 从链表中移除节点
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      // 节点是头节点
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      // 节点是尾节点
      this.tail = node.prev;
    }

    // 从映射中移除
    this.animateMap.delete(animate);
    this._animateCount--;

    // 如果移除的是最长时间的动画，应该重新计算总时长
    if (animate.getStartTime() + animate.getDuration() >= this._totalDuration) {
      this.recalculateTotalDuration();
    }

    return;
  }

  // 重新计算总时长
  protected recalculateTotalDuration() {
    this._totalDuration = 0;
    this.forEachAccessAnimate(animate => {
      this._totalDuration = Math.max(this._totalDuration, animate.getStartTime() + animate.getDuration());
    });
  }

  getTotalDuration() {
    return this._totalDuration;
  }

  getPlaySpeed() {
    return this._playSpeed;
  }

  setPlaySpeed(speed: number) {
    this._playSpeed = speed;
  }

  // 实现ITimeline接口所需的其他方法
  getPlayState(): 'playing' | 'paused' | 'stopped' {
    if (this.paused) {
      return 'paused';
    }
    if (this.animateCount === 0) {
      return 'stopped';
    }
    return 'playing';
  }

  setStartTime(time: number) {
    this._startTime = time;
  }

  getStartTime() {
    return this._startTime;
  }

  getCurrentTime() {
    return this._currentTime;
  }

  setCurrentTime(time: number) {
    this._currentTime = time;
  }
}

// 不会使用，存粹做临时存储用，请一定要放置到stage中才行
export const defaultTimeline = new DefaultTimeline();
defaultTimeline.isGlobal = true;
