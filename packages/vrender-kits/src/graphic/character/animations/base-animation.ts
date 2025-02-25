import type { EasingType, ICustomAnimate, IAnimateTarget, ISubAnimate } from '@visactor/vrender-core';
import type { Character } from '../character';
import type { AnimationState } from '../interface';

/**
 * 动画基类
 */
export abstract class BaseAnimation<T extends AnimationState, O extends { duration: number }>
  implements ICustomAnimate
{
  protected _character: Character;
  protected _state: T;
  protected _name: string;
  protected _target: IAnimateTarget;
  protected _subAnimate: ISubAnimate;
  protected _duration: number;

  get duration(): number {
    return this._duration;
  }

  readonly easing: EasingType;

  constructor(character: Character, name: string, duration: number = 0, easing: EasingType = 'linear') {
    this._character = character;
    this._name = name;
    this._duration = duration;
    this.easing = easing;
  }

  protected abstract updateState(ratio: number, option: O): void;

  /**
   * 播放动画
   * @param option 动画选项
   */
  play(option: O): void {
    if (this._target) {
      this._duration = option.duration;
      this._target.animate().play(this);
    }
  }

  bind(target: IAnimateTarget, subAnimate: ISubAnimate): void {
    this._target = target;
    this._subAnimate = subAnimate;
  }

  onBind(): void {
    // 可以在这里进行绑定后的初始化
  }

  update(end: boolean, ratio: number, out: Record<string, any>): void {
    this.onUpdate(end, ratio, out);
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (!this._state) {
      return;
    }
    this._state.progress = ratio;
    if (!this._state.isPlaying) {
      return;
    }
    this.updateState(ratio, out as O);
  }

  onFirstRun(): void {
    if (this._state) {
      this._state.isPlaying = true;
    }
  }

  onStart(): void {
    if (this._state) {
      this._state.isPlaying = true;
    }
  }

  onEnd(): void {
    if (this._state) {
      this._state.isPlaying = false;
    }
  }

  getFromProps(): Record<string, any> {
    return {};
  }

  getEndProps(): Record<string, any> {
    return {};
  }

  getMergedEndProps(): Record<string, any> {
    return {};
  }

  stop(): void {
    if (this._state) {
      this._state.isPlaying = false;
    }
  }
}
