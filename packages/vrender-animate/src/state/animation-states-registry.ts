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
    // appear动画，可以被任何动画覆盖，但不会停止（disappear、exit除外）
    this.registerTransition('appear', '*', () => ({
      allowTransition: true,
      stopOriginalTransition: false
    }));
    // appear 动画碰到appear动画，什么都不会发生
    this.registerTransition('appear', 'appear', () => ({
      allowTransition: false,
      stopOriginalTransition: false
    }));
    this.registerTransition('appear', 'disappear', () => ({
      allowTransition: true,
      stopOriginalTransition: true
    }));
    this.registerTransition('appear', 'exit', () => ({
      allowTransition: true,
      stopOriginalTransition: true
    }));

    // 循环动画（normal），可以被任何动画覆盖，但不会停止（disappear、exit除外）
    this.registerTransition('normal', '*', () => ({
      allowTransition: true,
      stopOriginalTransition: false
    }));
    // 循环动画碰到循环动画，什么都不会发生
    this.registerTransition('normal', 'normal', () => ({
      allowTransition: false,
      stopOriginalTransition: false
    }));
    this.registerTransition('normal', 'disappear', () => ({
      allowTransition: true,
      stopOriginalTransition: true
    }));
    this.registerTransition('normal', 'exit', () => ({
      allowTransition: true,
      stopOriginalTransition: true
    }));

    // 退出动画不能被覆盖或停止(disappear除外)
    this.registerTransition('exit', '*', () => ({
      allowTransition: false,
      stopOriginalTransition: false
    }));
    this.registerTransition('exit', 'disappear', () => ({
      allowTransition: true,
      stopOriginalTransition: true
    }));
    // 退出动画碰到enter动画，会立即停止
    this.registerTransition('exit', 'enter', () => ({
      allowTransition: true,
      stopOriginalTransition: true
    }));
    // 退出动画碰到退出，什么都不会发生
    this.registerTransition('exit', 'exit', () => ({
      allowTransition: false,
      stopOriginalTransition: false
    }));

    // enter 动画可以被任何动画覆盖，但不会停止（exit、disappear除外）
    this.registerTransition('enter', '*', () => ({
      allowTransition: true,
      stopOriginalTransition: false
    }));
    // enter 动画碰到enter动画，什么都不会发生
    this.registerTransition('enter', 'enter', () => ({
      allowTransition: false,
      stopOriginalTransition: false
    }));
    this.registerTransition('enter', 'disappear', () => ({
      allowTransition: true,
      stopOriginalTransition: true
    }));
    this.registerTransition('enter', 'exit', () => ({
      allowTransition: true,
      stopOriginalTransition: true
    }));

    // disappear 动画碰到任何动画，什么都不会发生（appear除外）
    this.registerTransition('disappear', '*', () => ({
      allowTransition: false,
      stopOriginalTransition: false
    }));

    // disappear 动画碰到appear动画，会立即停止
    this.registerTransition('disappear', 'appear', () => ({
      allowTransition: true,
      stopOriginalTransition: true
    }));
  }

  /**
   * 检查两个状态之间是否允许转换
   */
  isTransitionAllowed(fromState: string, toState: string, graphic: IGraphic): ITransitionResult {
    // 直接转换规则
    let func = this.transitions.get(fromState)?.get(toState);
    if (func) {
      return func(graphic, fromState);
    }

    // 状态到通配符
    func = this.transitions.get(fromState)?.get('*');
    if (func) {
      return func(graphic, fromState);
    }

    // 通配符到状态
    func = this.transitions.get('*')?.get(toState);
    if (func) {
      return func(graphic, fromState);
    }

    // 通配符到通配符
    func = this.transitions.get('*')?.get('*');
    if (func) {
      return func(graphic, fromState);
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
