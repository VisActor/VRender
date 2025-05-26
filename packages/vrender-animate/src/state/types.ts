import type { IGraphic } from '@visactor/vrender-core';
import type { IAnimationConfig } from '../executor/executor';

export interface IAnimationState {
  /**
   * 状态名称
   */
  name: string;

  /**
   * 动画配置
   */
  animation: IAnimationConfig;
}

/**
 * Animation state manager for a graphic
 */
export interface IAnimationStateManager {
  /**
   * Register a state for the graphic
   */
  registerState: (state: IAnimationState) => void;

  /**
   * Apply a state to the graphic
   */
  applyState: (state: string | string[]) => void;

  /**
   * Clear all states from the graphic
   */
  clearStates: () => void;

  /**
   * Get the current state of the graphic
   */
  getCurrentState: () => string | string[] | null;
}
