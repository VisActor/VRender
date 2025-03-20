import type { IGraphic } from '@visactor/vrender-core';
import type { IAnimationState } from './types';
import { AnimationTransitionRegistry } from './animation-states-registry';
import type { IAnimationConfig } from '../executor/executor';
import { AnimateExecutor } from '../executor/animate-executor';

export class AnimationStateStore {
  graphic: IGraphic;

  constructor(graphic: IGraphic) {
    this.graphic = graphic;
  }

  // 动画状态配置
  // 并不是所有图元都有（只有mark才有），所以在应用状态的时候，需要额外传入
  states?: Map<string, IAnimationState>;

  registerState(state: IAnimationState): void {
    if (!this.states) {
      this.states = new Map();
    }
    this.states.set(state.name, state);
  }

  clearStates(): void {
    this.states?.clear();
  }
}

// 一个状态对应一个执行器，每个图元都有一一对应
interface IStateInfo {
  state: string;
  animationConfig: IAnimationConfig;
  executor: AnimateExecutor;
}

export class AnimationStateManager {
  protected graphic: IGraphic;

  // 当前状态
  // TODO（注意，这里无法了解动画的顺序，既有串行也有并行，具体在执行的时候确定，执行之后就无法获取串行或并行配置了）
  stateList: IStateInfo[] | null = null;

  constructor(graphic: IGraphic) {
    this.graphic = graphic;
  }

  // TODO 这里因为只有状态变更才会调用，所以代码写的比较宽松，如果有性能问题需要优化
  /**
   * 应用状态
   * @param nextState 下一个状态数组，如果传入数组，那么状态是串行的。但是每次applyState都会立即执行动画，也就是applyState和applyState之间是并行
   * @param animationConfig 动画配置
   */
  applyState(nextState: string[], animationConfig: IAnimationState[]): void {
    const registry = AnimationTransitionRegistry.getInstance();

    // TODO 这里指判断第一个状态，后续如果需要的话要循环判断
    const _stateList = this.stateList[0];
    // 检查是否需要停止当前状态，以及下一个状态是否需要应用
    const shouldStopState: IStateInfo[] = [];
    const shouldApplyState: IStateInfo[] = [];
    if (!_stateList) {
      nextState.forEach((state, index) => {
        shouldApplyState.push({
          state,
          animationConfig: animationConfig[index].animation,
          executor: new AnimateExecutor(this.graphic)
        });
      });
    } else {
      nextState.forEach((state, index) => {
        const result = registry.isTransitionAllowed(_stateList.state, state, this.graphic);
        if (result.allowTransition) {
          shouldApplyState.push({
            state,
            animationConfig: animationConfig[index].animation,
            executor: new AnimateExecutor(this.graphic)
          });
        }
        if (result.stopOriginalTransition) {
          shouldStopState.push(_stateList);
        }
      });
    }

    // 停止动画
    shouldStopState.forEach(state => {
      state.executor.stop();
    });

    // 立即应用动画，串行的应用
    for (let i = 0; i < shouldApplyState.length; i++) {
      shouldApplyState[i].executor.execute(shouldApplyState[i].animationConfig);
      // 如果下一个状态存在，那么下一个状态的动画在当前状态动画结束后立即执行
      const nextState = shouldApplyState[i + 1];
      shouldApplyState[i].executor.onEnd(() => {
        if (nextState) {
          nextState.executor.execute(nextState.animationConfig);
        }
        // 删除这个状态
        this.stateList = this.stateList.filter(state => state !== shouldApplyState[i]);
      });
    }

    this.stateList = this.stateList.filter(state => !shouldStopState.includes(state));
    this.stateList.push(...shouldApplyState);
  }

  clearState(): void {
    this.stateList = null;
  }

  // getstateList(): string[] | null {
  //   return this.stateList;
  // }
}
