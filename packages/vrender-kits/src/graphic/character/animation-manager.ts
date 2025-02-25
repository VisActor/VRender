import type { Character } from './character';
import type { AdvancedAnimationConfig, PoseState } from './interface';
import { MorphAnimation } from './animations/morph-animation';
import { MotionAnimation } from './animations/motion-animation';
import { SkeletonAnimation } from './animations/skeleton-animation';

/**
 * 动画管理器 - 统一管理所有类型的动画
 */
export class AnimationManager {
  private _character: Character;
  private _config: AdvancedAnimationConfig;

  // 各类动画实例
  private _morphAnimations: Map<string, MorphAnimation> = new Map();
  private _motionAnimations: Map<string, MotionAnimation> = new Map();
  private _skeletonAnimations: Map<string, SkeletonAnimation> = new Map();

  constructor(character: Character, config?: AdvancedAnimationConfig) {
    this._character = character;
    this._config = config || {};
    this._initAnimations();
  }

  private _initAnimations() {
    // 初始化形变动画
    if (this._config.morphs) {
      Object.entries(this._config.morphs).forEach(([partName, config]) => {
        const animation = new MorphAnimation(this._character, partName, config);
        this._morphAnimations.set(partName, animation);
      });
    }

    // 初始化运动动画
    if (this._config.motions) {
      Object.entries(this._config.motions).forEach(([partName, config]) => {
        const animation = new MotionAnimation(this._character, partName, config);
        this._motionAnimations.set(partName, animation);
      });
    }
  }

  /**
   * 播放骨骼动画
   */
  playPoseAnimation(targetPose: PoseState, duration: number = 1000, easing: string = 'linear') {
    const animation = new SkeletonAnimation(this._character, targetPose, duration, easing);
    const id = `pose_${Date.now()}`;
    this._skeletonAnimations.set(id, animation);
    // animation.onEnd(() => {
    //   this._skeletonAnimations.delete(id);
    // });
    // animation.play();
  }

  /**
   * 播放形变动画
   */
  playMorphAnimation(partName: string, targetState: string, duration: number) {
    const animation = this._morphAnimations.get(partName);
    if (!animation) {
      console.warn(`No morph animation found for part: ${partName}`);
      return;
    }
    animation.playTo(targetState, duration);
  }

  /**
   * 播放运动动画
   */
  playMotionAnimation(partName: string) {
    const animation = this._motionAnimations.get(partName);
    if (!animation) {
      console.warn(`No motion animation found for part: ${partName}`);
      return;
    }
    // animation.play();
  }

  /**
   * 创建动画组合
   * @param config 动画组合配置
   */
  createAnimationGroup(config: {
    pose?: { targetPose: PoseState; duration: number };
    morphs?: Array<{ part: string; state: string; duration: number }>;
    motions?: string[];
  }) {
    // 播放骨骼动画
    if (config.pose) {
      this.playPoseAnimation(config.pose.targetPose, config.pose.duration);
    }

    // 播放形变动画
    if (config.morphs) {
      config.morphs.forEach(({ part, state, duration }) => {
        this.playMorphAnimation(part, state, duration);
      });
    }

    // 播放运动动画
    if (config.motions) {
      config.motions.forEach(part => {
        this.playMotionAnimation(part);
      });
    }
  }

  /**
   * 停止指定部件的动画
   */
  stopAnimation(partName: string) {
    this._morphAnimations.get(partName)?.stop();
    this._motionAnimations.get(partName)?.stop();
  }

  /**
   * 停止所有动画
   */
  stopAll() {
    this._morphAnimations.forEach(animation => animation.stop());
    this._motionAnimations.forEach(animation => animation.stop());
    this._skeletonAnimations.forEach(animation => animation.stop());
  }

  /**
   * 释放资源
   */
  release() {
    this.stopAll();
    this._morphAnimations.clear();
    this._motionAnimations.clear();
    this._skeletonAnimations.clear();
  }
}
