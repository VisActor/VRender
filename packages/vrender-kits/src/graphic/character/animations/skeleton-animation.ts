import type { Character } from '../character';
import type { PoseState, SkeletonState } from '../interface';
import { BaseAnimation } from './base-animation';

interface ISkeletonAnimateOption {
  duration: number;
  easing?: string;
}

/**
 * 骨骼动画
 */
export class SkeletonAnimation extends BaseAnimation<SkeletonState, ISkeletonAnimateOption> {
  constructor(character: Character, targetPose: PoseState, duration: number, easing: string = 'linear') {
    super(character, 'skeleton');
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
                fromState.position[0] + (targetState.position[0] - fromState.position[0]) * ratio,
                fromState.position[1] + (targetState.position[1] - fromState.position[1]) * ratio
              ]
            : targetState.position,
        rotation:
          targetState.rotation !== undefined && fromState.rotation !== undefined
            ? fromState.rotation + (targetState.rotation - fromState.rotation) * ratio
            : targetState.rotation,
        scale:
          targetState.scale && fromState.scale
            ? [
                fromState.scale[0] + (targetState.scale[0] - fromState.scale[0]) * ratio,
                fromState.scale[1] + (targetState.scale[1] - fromState.scale[1]) * ratio
              ]
            : targetState.scale
      };
    });

    this._state.currentPose = currentPose;
    this._character.applyPose(currentPose);
  }
}
