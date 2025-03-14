import { AnimateStatus, Generator } from '@visactor/vrender-core';
import type { IAnimate } from './intreface/animate';
import type { ITimeline } from './intreface/timeline';

export class DefaultTimeline implements ITimeline {
  declare id: number;
  protected animates: IAnimate[] = [];
  protected declare ticker: any;
  protected declare paused: boolean;

  // 添加必要的属性
  protected _playSpeed: number = 1;
  protected _totalDuration: number = 0;
  protected _startTime: number = 0;
  protected _currentTime: number = 0;

  // 0 ... _endAnimatePtr ... animates.length
  // [0, _endAnimatePtr] 表示正在运行的动画
  // (_endAnimatePtr, animates.length) 表示已经结束的动画
  protected _endAnimatePtr: number = -1;

  declare isGlobal?: boolean;

  get animateCount() {
    return this.animates.length;
  }

  constructor() {
    this.id = Generator.GenAutoIncrementId();
    this.animates = [];
    this.paused = false;
  }

  isRunning() {
    return !this.paused && this._endAnimatePtr >= 0;
  }

  forEachAccessAnimate(cb: (animate: IAnimate, index: number) => void) {
    for (let i = 0; i <= this._endAnimatePtr; i++) {
      cb(this.animates[i], i);
    }
  }

  addAnimate(animate: IAnimate) {
    this.animates.push(animate);
    // 交换位置
    this._endAnimatePtr++;
    this.animates[this.animates.length - 1] = this.animates[this._endAnimatePtr];
    this.animates[this._endAnimatePtr] = animate;
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
        this.removeAnimate(animate, true, i);
      } else if (animate.status === AnimateStatus.RUNNING || animate.status === AnimateStatus.INITIAL) {
        animate.advance(scaledDelta);
      }
    });
  }

  clear() {
    this.forEachAccessAnimate(animate => {
      animate.release();
    });
    this.animates = [];
    this._totalDuration = 0;
  }

  removeAnimate(animate: IAnimate, release: boolean = true, index?: number) {
    if (this._endAnimatePtr < 0) {
      return;
    }
    animate._onRemove && animate._onRemove.forEach(cb => cb());
    release && animate.release();

    index = index ?? this.animates.indexOf(animate);
    // 交换位置
    this.animates[index] = this.animates[this._endAnimatePtr];
    this._endAnimatePtr--;
    return;
  }

  // 重新计算总时长
  protected recalculateTotalDuration() {
    this._totalDuration = 0;
    this.animates.forEach(animate => {
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

export const defaultTimeline = new DefaultTimeline();
defaultTimeline.isGlobal = true;
