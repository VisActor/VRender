import type { IGraphic } from '@visactor/vrender-core';
import type { IAnimationState } from './types';
import { AnimationStateManager, AnimationStateStore } from './animation-state';
import type { IAnimationConfig } from '../executor/executor';

/**
 * 将动画状态方法作为混入扩展 Graphic 的类
 */
export class GraphicStateExtension {
  _getAnimationStateManager(graphic: IGraphic): AnimationStateManager {
    if (!(graphic as any)._animationStateManager) {
      // Create the appropriate manager type based on whether this is a group
      (graphic as any)._animationStateManager = new AnimationStateManager(graphic);
    }
    return (graphic as any)._animationStateManager;
  }
  _getAnimationStateStore(graphic: IGraphic): AnimationStateStore {
    if (!(graphic as any)._animationStateStore) {
      // Create the appropriate manager type based on whether this is a group
      (graphic as any)._animationStateStore = new AnimationStateStore(graphic);
    }
    return (graphic as any)._animationStateStore;
  }

  /**
   * 注册一个动画状态
   */
  registerAnimationState(state: IAnimationState): this {
    this._getAnimationStateStore(this as unknown as IGraphic).registerState(state);
    return this;
  }

  /**
   * 应用一个动画状态到图形
   */
  applyAnimationState(
    state: string[],
    animationConfig: (IAnimationState | IAnimationState[])[],
    callback?: (empty?: boolean) => void
  ): this {
    this._getAnimationStateManager(this as unknown as IGraphic).applyState(state, animationConfig, callback);
    return this;
  }

  /**
   * 应用出现动画状态
   * @param animationConfig 动画配置
   * @param callback 动画结束回调
   */
  applyAppearState(animationConfig: IAnimationConfig, callback?: () => void): this {
    this._getAnimationStateManager(this as unknown as IGraphic).applyAppearState(animationConfig, callback);
    return this;
  }

  /**
   * 应用消失动画状态
   * @param animationConfig 动画配置
   * @param callback 动画结束回调
   */
  applyDisappearState(animationConfig: IAnimationConfig, callback?: () => void): this {
    this._getAnimationStateManager(this as unknown as IGraphic).applyDisappearState(animationConfig, callback);
    return this;
  }

  /**
   * 应用更新动画状态
   * @param animationConfig 动画配置
   * @param callback 动画结束回调
   */
  applyUpdateState(animationConfig: IAnimationConfig, callback?: () => void): this {
    this._getAnimationStateManager(this as unknown as IGraphic).applyUpdateState(animationConfig, callback);
    return this;
  }

  /**
   * 应用高亮动画状态
   * @param animationConfig 动画配置
   * @param callback 动画结束回调
   */
  applyHighlightState(animationConfig: IAnimationConfig, callback?: () => void): this {
    this._getAnimationStateManager(this as unknown as IGraphic).applyHighlightState(animationConfig, callback);
    return this;
  }

  /**
   * 应用取消高亮动画状态
   * @param animationConfig 动画配置
   * @param callback 动画结束回调
   */
  applyUnhighlightState(animationConfig: IAnimationConfig, callback?: () => void): this {
    this._getAnimationStateManager(this as unknown as IGraphic).applyUnhighlightState(animationConfig, callback);
    return this;
  }

  /**
   * 停止一个动画状态
   */
  stopAnimationState(state: string, type?: 'start' | 'end' | Record<string, any>): this {
    this._getAnimationStateManager(this as unknown as IGraphic).stopState(state, type);
    return this;
  }

  /**
   * 清除图形上的所有动画状态
   */
  clearAnimationStates(): this {
    this._getAnimationStateManager(this as unknown as IGraphic).clearState();
    return this;
  }

  // /**
  //  * 获取图形当前的动画状态
  //  */
  // getCurrentAnimationState(): string[] | null {
  //   return this._getAnimationStateManager(this as unknown as IGraphic).getCurrentState();
  // }

  /**
   * 继承
   */
  static extend(graphic: IGraphic): IGraphic {
    const extension = new GraphicStateExtension();
    extension._getAnimationStateManager(graphic);
    return graphic;
  }
}
