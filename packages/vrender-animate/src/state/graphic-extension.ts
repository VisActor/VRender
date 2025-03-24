import type { IGraphic } from '@visactor/vrender-core';
import type { IAnimationState } from './types';
import { AnimationStateManager, AnimationStateStore } from './animation-state';

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
  applyAnimationState(state: string[], animationConfig: IAnimationState[], callback?: (empty?: boolean) => void): this {
    this._getAnimationStateManager(this as unknown as IGraphic).applyState(state, animationConfig, callback);
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
