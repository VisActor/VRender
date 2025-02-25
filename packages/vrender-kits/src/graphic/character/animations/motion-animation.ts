import type { Character } from '../character';
import type { MotionConfig, MotionState } from '../interface';
import { BaseAnimation } from './base-animation';
import { CustomPath2D, CurveContext } from '@visactor/vrender-core';

interface IMotionAnimateOption {
  duration: number;
  loop?: boolean;
}

/**
 * 运动动画
 */
export class MotionAnimation extends BaseAnimation<MotionState, IMotionAnimateOption> {
  private _config: MotionConfig;
  private _partName: string;
  private _pathInstance: CustomPath2D;

  constructor(character: Character, partName: string, config: MotionConfig) {
    super(character, 'motion', config.duration, 'linear');
    this._config = config;
    this._partName = partName;
    this._state = {
      isPlaying: false,
      progress: 0,
      duration: config.duration,
      path: config.path,
      position: [0, 0],
      rotation: 0,
      followPath: config.followPath ?? true
    };

    // 初始化路径实例
    this._initPath();
  }

  private _initPath(): void {
    // 创建路径实例
    this._pathInstance = new CustomPath2D();
    this._pathInstance.setCtx(new CurveContext(this._pathInstance));
    this._pathInstance.fromString(this._state.path, 0, 0, 1, 1);
  }

  /**
   * 开始播放运动动画
   */
  start(): void {
    this.play({
      duration: this._config.duration,
      loop: this._config.loop
    });
  }

  /**
   * 计算路径上的位置
   */
  private _calculatePositionOnPath(ratio: number): [number, number] {
    const { pos } = this._pathInstance.getAttrAt(ratio * this._pathInstance.getLength());
    return [pos.x, pos.y];
  }

  /**
   * 计算路径上的旋转角度
   */
  private _calculateRotationOnPath(ratio: number): number {
    const { angle } = this._pathInstance.getAttrAt(ratio * this._pathInstance.getLength());
    return angle;
  }

  protected updateState(ratio: number, option: IMotionAnimateOption): void {
    const part = this._character.getPart(this._partName);
    if (!part) {
      return;
    }

    // 计算路径上的位置和旋转
    const position = this._calculatePositionOnPath(ratio);
    const rotation = this._state.followPath ? this._calculateRotationOnPath(ratio) : 0;

    this._state.position = position;
    this._state.rotation = rotation;

    // 更新部件的位置和旋转
    part.graphic.setAttribute('x', position[0]);
    part.graphic.setAttribute('y', position[1]);
    if (this._state.followPath) {
      part.graphic.setAttribute('angle', rotation);
    }
  }

  onEnd(): void {
    super.onEnd();

    // 如果配置了循环播放，则重新开始动画
    if (this._config.loop) {
      this.start();
    }
  }
}
