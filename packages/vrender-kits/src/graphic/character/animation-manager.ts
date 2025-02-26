import type { EasingType } from '@visactor/vrender-core';
import type { Character } from './character';
import type { AdvancedAnimationConfig, PoseState } from './interface';
import { MorphAnimation } from './animations/morph-animation';
import { MotionAnimation } from './animations/motion-animation';
import { SkeletonAnimation } from './animations/skeleton-animation';

/**
 * 动画选项接口
 */
interface IAnimationOptions {
  loops?: number;
  alternate?: boolean;
  easing?: EasingType;
  onComplete?: () => void;
}

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
  playPoseAnimation(targetPose: PoseState, duration: number = 1000, easing: EasingType = 'linear') {
    const animation = new SkeletonAnimation(this._character, targetPose, duration, easing);
    // 使用Character的animate系统播放动画
    return this._character.animate().play(animation);
  }

  /**
   * 播放循环骨骼动画
   * @param targetPose 目标姿势
   * @param duration 动画持续时间
   * @param options 动画选项
   */
  playLoopPoseAnimation(
    targetPose: PoseState,
    duration: number = 1000,
    options: {
      loops?: number; // 循环次数，0表示无限循环
      alternate?: boolean; // 是否交替反向播放
      easing?: EasingType; // 缓动函数
      onComplete?: () => void; // 动画完成回调
    } = {}
  ) {
    const { loops = 1, alternate = false, easing = 'linear', onComplete } = options;

    // 创建动画实例
    const animation = new SkeletonAnimation(this._character, targetPose, duration, easing);

    // 使用Character的animate系统播放动画
    const animateInstance = this._character.animate().play(animation);

    // 设置循环
    if (loops !== 1) {
      if (loops === 0) {
        // 无限循环
        animateInstance.loop(Number.MAX_SAFE_INTEGER);
      } else {
        // 指定次数循环
        animateInstance.loop(loops);
      }
    }

    // 设置方向
    if (alternate) {
      // 使用bounce代替alternate
      animateInstance.bounce(true);
    }

    // 设置完成回调
    if (onComplete) {
      animateInstance.onEnd(onComplete);
    }

    return animateInstance;
  }

  /**
   * 播放往返姿势动画
   */
  playPingPongPoseAnimation(
    targetPose: PoseState,
    duration: number = 1000,
    options: Omit<IAnimationOptions, 'alternate'> = {}
  ) {
    // 使用playLoopPoseAnimation并强制设置alternate为true
    return this.playLoopPoseAnimation(targetPose, duration, {
      ...options,
      alternate: true
    });
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
