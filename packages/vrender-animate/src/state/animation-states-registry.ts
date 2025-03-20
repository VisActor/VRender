import type { IGraphic } from '@visactor/vrender-core';

interface ITransitionResult {
  allowTransition: boolean;
  stopOriginalTransition: boolean;
}

/**
 * 注册动画状态切换的转换函数
 */
export type TransitionFunction = (graphic: IGraphic, fromState: string) => ITransitionResult;

/**
 * 动画状态切换的注册表
 * 管理所有图形的动画状态切换逻辑
 */
export class AnimationTransitionRegistry {
  private static instance: AnimationTransitionRegistry;

  // 源状态到目标状态的映射，每个目标状态都有一个转换函数
  private transitions: Map<string, Map<string, TransitionFunction>> = new Map();

  constructor() {
    this.registerDefaultTransitions();
  }

  /**
   * 获取注册表的单例实例
   */
  static getInstance(): AnimationTransitionRegistry {
    if (!AnimationTransitionRegistry.instance) {
      AnimationTransitionRegistry.instance = new AnimationTransitionRegistry();
    }
    return AnimationTransitionRegistry.instance;
  }

  /**
   * 注册默认的转换规则
   */
  private registerDefaultTransitions(): void {
    // 设置默认的转换规则
    // 退出动画不能被中断，除非是进入动画
    this.registerTransition('exit', 'enter', () => ({
      allowTransition: true,
      stopOriginalTransition: true
    }));
    this.registerTransition('exit', '*', () => ({
      allowTransition: false,
      stopOriginalTransition: false
    }));

    // 进入动画可以被任何动画中断
    this.registerTransition('enter', '*', () => ({
      allowTransition: true,
      stopOriginalTransition: true
    }));

    // Disappear 是一个退出动画，遵循相同的规则
    this.registerTransition('disappear', 'enter', () => ({
      allowTransition: true,
      stopOriginalTransition: true
    }));
    this.registerTransition('disappear', 'appear', () => ({
      allowTransition: true,
      stopOriginalTransition: true
    }));
    this.registerTransition('disappear', '*', () => ({
      allowTransition: false,
      stopOriginalTransition: false
    }));

    // Appear 是一个进入动画，可以被任何动画中断
    this.registerTransition('appear', '*', () => ({
      allowTransition: true,
      stopOriginalTransition: true
    }));
  }

  /**
   * 检查两个状态之间是否允许转换
   */
  isTransitionAllowed(fromState: string, toState: string, graphic: IGraphic): ITransitionResult {
    // 直接转换规则
    if (this.transitions.get(fromState)?.has(toState)) {
      return this.transitions.get(fromState).get(toState)(graphic, fromState);
    }

    // 状态到通配符
    if (this.transitions.get(fromState)?.has('*')) {
      return this.transitions.get(fromState).get('*')(graphic, fromState);
    }

    // 通配符到状态
    if (this.transitions.get('*')?.has(toState)) {
      return this.transitions.get('*').get(toState)(graphic, fromState);
    }

    // 通配符到通配符
    if (this.transitions.get('*')?.has('*')) {
      return this.transitions.get('*').get('*')(graphic, fromState);
    }

    // 默认允许转换
    return {
      allowTransition: true,
      stopOriginalTransition: true
    };
  }

  /**
   * 注册两个状态之间的转换
   */
  registerTransition(fromState: string, toState: string, transition: TransitionFunction): void {
    let fromStateMap = this.transitions.get(fromState);

    if (!fromStateMap) {
      fromStateMap = new Map();
      this.transitions.set(fromState, fromStateMap);
    }

    fromStateMap.set(toState, transition);
  }
}

// 初始化单例转换注册表
const transitionRegistry = AnimationTransitionRegistry.getInstance();

export { transitionRegistry };
