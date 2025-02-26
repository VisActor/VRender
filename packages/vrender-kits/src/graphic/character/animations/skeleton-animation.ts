import type { EasingType } from '@visactor/vrender-core';
import type { Character } from '../character';
import type { PoseState, SkeletonState } from '../interface';
import { BaseAnimation } from './base-animation';

interface ISkeletonAnimateOption {
  duration: number;
  easing?: EasingType;
}

export interface ISkeletonAnimationOptions {
  loops?: number; // 循环次数，0表示无限循环
  alternate?: boolean; // 是否交替反向播放
  onComplete?: () => void; // 动画完成回调
}

/**
 * 骨骼动画
 */
export class SkeletonAnimation extends BaseAnimation<SkeletonState, ISkeletonAnimateOption> {
  // 循环次数，0表示无限循环
  private _loops: number = 0;
  // 是否交替反向播放
  private _alternate: boolean = false;
  // 动画完成回调
  onComplete?: () => void;
  // 当前循环计数
  private _currentLoop: number = 0;
  // 是否正在反向播放
  private _isReversed: boolean = false;

  constructor(
    character: Character,
    targetPose: PoseState,
    duration: number,
    easing: EasingType = 'linear',
    options: ISkeletonAnimationOptions = {}
  ) {
    super(character, 'skeleton', duration, easing);

    this._loops = options.loops || 0;
    this._alternate = options.alternate || false;
    this.onComplete = options.onComplete;

    this._state = {
      isPlaying: false,
      progress: 0,
      duration,
      fromPose: character.getCurrentPose(),
      toPose: targetPose,
      currentPose: character.getCurrentPose()
    };
  }

  protected updateState(ratio: number, option: ISkeletonAnimateOption): void {
    // 处理循环和交替效果
    let actualRatio = ratio;

    if (this._alternate && this._isReversed) {
      // 反向播放时，反转比率
      actualRatio = 1 - ratio;
    }

    // 插值计算当前姿势
    const currentPose: PoseState = {};
    Object.entries(this._state.toPose).forEach(([jointName, targetState]) => {
      const fromState = this._state.fromPose[jointName];
      if (!fromState) {
        currentPose[jointName] = targetState;
        return;
      }

      currentPose[jointName] = {
        position:
          targetState.position && fromState.position
            ? [
                fromState.position[0] + (targetState.position[0] - fromState.position[0]) * actualRatio,
                fromState.position[1] + (targetState.position[1] - fromState.position[1]) * actualRatio
              ]
            : targetState.position,
        rotation:
          targetState.rotation !== undefined && fromState.rotation !== undefined
            ? fromState.rotation + (targetState.rotation - fromState.rotation) * actualRatio
            : targetState.rotation,
        scale:
          targetState.scale && fromState.scale
            ? [
                fromState.scale[0] + (targetState.scale[0] - fromState.scale[0]) * actualRatio,
                fromState.scale[1] + (targetState.scale[1] - fromState.scale[1]) * actualRatio
              ]
            : targetState.scale
      };
    });

    this._state.currentPose = currentPose;
    this._character.applyPose(currentPose);
  }
}
