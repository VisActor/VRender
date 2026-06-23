import type { IAnimate, IGraphic } from '@visactor/vrender-core';
import type { IAnimationState } from './types';
import { AnimationStateManager, AnimationStateStore } from './animation-state';
import type { IAnimationConfig } from '../executor/executor';

/**
 * 将动画状态方法作为混入扩展 Graphic 的类
 */
export class GraphicStateExtension {
  _getAnimationStateManager(graphic: IGraphic): AnimationStateManager {
    if (!(graphic as any)._animationStateManager) {
      (graphic as any)._animationStateManager = new AnimationStateManager(graphic);
    }
    return (graphic as any)._animationStateManager;
  }
  _getAnimationStateStore(graphic: IGraphic): AnimationStateStore {
    if (!(graphic as any)._animationStateStore) {
      (graphic as any)._animationStateStore = new AnimationStateStore(graphic);
    }
    return (graphic as any)._animationStateStore;
  }

  trackAnimate(animate: IAnimate): void {
    this._getAnimationStateManager(this as unknown as IGraphic).trackAnimate(animate);
  }

  untrackAnimate(animateId: string | number): void {
    const manager = (this as any)._animationStateManager as AnimationStateManager;
    manager?.untrackAnimate(animateId);
  }

  forEachTrackedAnimate(cb: (animate: IAnimate) => void): void {
    const manager = (this as any)._animationStateManager as AnimationStateManager;
    manager?.forEachTrackedAnimate(cb);
  }

  getTrackedAnimates(): Map<string | number, IAnimate> {
    return this._getAnimationStateManager(this as unknown as IGraphic).getTrackedAnimates();
  }

  hasTrackedAnimate(): boolean {
    const manager = (this as any)._animationStateManager as AnimationStateManager;
    return manager ? manager.hasTrackedAnimate() : false;
  }

  /**
   * 注册一个动画状态
   */
  registerAnimationState(state: IAnimationState): this {
    this._getAnimationStateStore(this as unknown as IGraphic).registerState(state);
    return this;
  }

  /**
   * 应用一个动画状态到图形。
   * 这里只负责把已经编排好的动画配置转交给 AnimationStateManager，
   * 不参与 graphic 状态语义、样式解析或属性分类。
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
  stopAnimationState(state: string, type?: 'start' | 'end' | Record<string, any>, deep: boolean = false): this {
    this._getAnimationStateManager(this as unknown as IGraphic).stopState(state, type);
    if (deep && (this as any).isContainer) {
      (this as any).forEachChildren((child: any) => {
        child.stopAnimationState(state, type, deep);
      });
    }
    return this;
  }

  /**
   * 清除图形上的所有动画执行状态，不修改 graphic.currentStates / normalAttrs。
   */
  clearAnimationStates(): this {
    const stateManager = (this as any)._animationStateManager as AnimationStateManager;
    if (stateManager) {
      stateManager.clearState();
    }
    return this;
  }

  reApplyAnimationState(state: string, deep: boolean = false): this {
    const stateManager = (this as any)._animationStateManager as AnimationStateManager;
    if (stateManager) {
      stateManager.reApplyState(state);
    }
    if (deep && (this as any).isContainer) {
      (this as any).forEachChildren((child: any) => {
        child.reApplyAnimationState(state, deep);
      });
    }
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
    return graphic;
  }
}
