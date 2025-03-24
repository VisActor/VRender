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
   * @param callback 动画结束后的回调函数，参数empty为true表示没有动画需要执行直接调的回调
   */
  applyState(nextState: string[], animationConfig: IAnimationState[], callback?: (empty?: boolean) => void): void {
    const registry = AnimationTransitionRegistry.getInstance();

    // TODO 这里指判断第一个状态，后续如果需要的话要循环判断
    // 检查是否需要停止当前状态，以及下一个状态是否需要应用
    const shouldStopState: IStateInfo[] = [];
    const shouldApplyState: IStateInfo[] = [];
    if (!(this.stateList && this.stateList.length)) {
      nextState.forEach((state, index) => {
        shouldApplyState.push({
          state,
          animationConfig: animationConfig[index].animation,
          executor: new AnimateExecutor(this.graphic)
        });
      });
    } else {
      // const _stateList = this.stateList[0];
      nextState.forEach((state, index) => {
        // 遍历this.stateList，获取result，只要有一个是false，那这个result就是false
        const result: { allowTransition: boolean; stopOriginalTransition: boolean } = {
          allowTransition: true,
          stopOriginalTransition: true
        };
        this.stateList.forEach(currState => {
          const _result = registry.isTransitionAllowed(currState.state, state, this.graphic);
          result.allowTransition = result.allowTransition && _result.allowTransition;
        });
        // 所有状态都允许过渡，则添加到shouldApplyState
        if (result.allowTransition) {
          shouldApplyState.push({
            state,
            animationConfig: animationConfig[index].animation,
            executor: new AnimateExecutor(this.graphic)
          });
          // 允许过渡的话，需要重新遍历this.stateList，获取stopOriginalTransition
          this.stateList.forEach(currState => {
            const _result = registry.isTransitionAllowed(currState.state, state, this.graphic);
            if (_result.stopOriginalTransition) {
              shouldStopState.push(currState);
            }
          });
        }
      });
    }

    // 停止动画
    shouldStopState.forEach(state => {
      state.executor.stop();
    });

    // 立即应用动画，串行的应用
    if (shouldApplyState.length) {
      shouldApplyState[0].executor.execute(shouldApplyState[0].animationConfig);
      // 如果下一个状态存在，那么下一个状态的动画在当前状态动画结束后立即执行
      for (let i = 0; i < shouldApplyState.length; i++) {
        const nextState = shouldApplyState[i + 1];
        const currentState = shouldApplyState[i];
        currentState.executor.onEnd(() => {
          if (nextState) {
            nextState.executor.execute(nextState.animationConfig);
          }
          // 删除这个状态
          this.stateList = this.stateList.filter(state => state !== currentState);

          // 如果是最后一个状态且有回调，则调用回调
          if (i === shouldApplyState.length - 1 && callback) {
            callback(false);
          }
        });
      }
    } else if (callback) {
      // 如果没有需要应用的动画状态，直接调用回调
      callback(true);
    }

    if (this.stateList) {
      this.stateList = this.stateList.filter(state => !shouldStopState.includes(state));
    } else {
      this.stateList = [];
    }
    this.stateList.push(...shouldApplyState);
  }

  stopState(state: string, type?: 'start' | 'end' | Record<string, any>): void {
    const stateInfo = this.stateList?.find(stateInfo => stateInfo.state === state);
    if (stateInfo) {
      stateInfo.executor.stop(type);
    }
  }

  clearState(): void {
    // 清空状态
    this.stateList?.forEach(state => {
      state.executor.stop();
    });
    this.stateList = null;
  }

  // getstateList(): string[] | null {
  //   return this.stateList;
  // }
}
