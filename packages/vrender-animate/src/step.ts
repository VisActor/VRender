import { ColorStore, ColorType, type IGraphic } from '@visactor/vrender-core';
import type { IAnimate, IStep } from './intreface/animate';
import type { EasingType, EasingTypeFunc } from './intreface/easing';
import type { IAnimateStepType } from './intreface/type';
import { Easing } from './utils/easing';
import { commonInterpolateUpdate, interpolateUpdateStore } from './interpolate/store';
import { isString } from '@visactor/vutils';

function noop() {
  //...
}

export class Step implements IStep {
  type: IAnimateStepType;
  prev?: IStep;
  duration: number;
  next?: IStep;
  props?: Record<string, any>;
  propKeys?: string[];
  interpolateUpdateFunctions?: ((
    key: string,
    from: number,
    to: number,
    ratio: number,
    step: IStep,
    target: IGraphic
  ) => void)[];
  easing: EasingTypeFunc;
  animate: IAnimate;
  target: IGraphic;
  fromProps: Record<string, any>;
  fromParsedProps: Record<string, any>;
  toParsedProps: Record<string, any>;

  // 内部状态
  protected _startTime: number = 0;
  _hasFirstRun: boolean = false;

  protected _endCb?: (animate: IAnimate, step: IStep) => void;

  constructor(type: IAnimateStepType, props: Record<string, any>, duration: number, easing: EasingType) {
    this.type = type;
    this.props = props;
    this.duration = duration;
    // 设置缓动函数
    if (easing) {
      this.easing = typeof easing === 'function' ? easing : Easing[easing];
    } else {
      this.easing = Easing.linear;
    }
    if (type === 'wait') {
      this.onUpdate = noop;
    }
  }

  bind(target: IGraphic, animate: IAnimate): void {
    this.target = target;
    this.animate = animate;
    this.onBind();
  }

  append(step: IStep): void {
    this.next = step;
    step.prev = this;

    // 更新绝对时间
    step.setStartTime(this.getStartTime() + this.duration, false);
  }

  // 更新下游节点的开始时间
  private updateDownstreamStartTimes(): void {
    let currentStep = this.next;
    let currentStartTime = this._startTime + this.duration;

    while (currentStep) {
      currentStep.setStartTime(currentStartTime, false);
      currentStartTime += currentStep.duration;
      currentStep = currentStep.next;
    }
    this.animate.updateDuration();
  }

  getLastProps(): any {
    if (this.prev) {
      return this.prev.props || {};
    }
    return this.animate.getStartProps();
  }

  setDuration(duration: number, updateDownstream: boolean = true): void {
    this.duration = duration;

    // 如果有后续节点，更新所有后续节点的开始时间
    if (updateDownstream) {
      this.updateDownstreamStartTimes();
    }
  }

  getDuration(): number {
    return this.duration;
  }

  determineInterpolateUpdateFunction(): void {
    // 根据属性类型确定插值更新函数
    // 这里可以进行优化，例如缓存不同类型属性的插值更新函数
    if (!this.props) {
      return;
    }

    const funcs: ((key: string, from: number, to: number, ratio: number, step: IStep, target: IGraphic) => void)[] = [];
    this.propKeys.forEach(key => {
      // 普通颜色特殊处理，需要提前解析成number[]
      if (key === 'fill' || key === 'stroke') {
        const from = this.getLastProps()[key];
        const to = this.props[key];
        if (isString(from) && isString(to)) {
          const fromArray = ColorStore.Get(from, ColorType.Color255);
          const toArray = ColorStore.Get(to, ColorType.Color255);
          if (!this.fromParsedProps) {
            this.fromParsedProps = {};
          }
          if (!this.toParsedProps) {
            this.toParsedProps = {};
          }
          this.fromParsedProps[key] = fromArray;
          this.toParsedProps[key] = toArray;
        }
        funcs.push((interpolateUpdateStore as any)[key === 'fill' ? 'fillPure' : 'strokePure']);
      } else if ((interpolateUpdateStore as any)[key]) {
        funcs.push((interpolateUpdateStore as any)[key]);
      } else {
        funcs.push(commonInterpolateUpdate);
      }
    });
    this.interpolateUpdateFunctions = funcs;
  }

  setStartTime(time: number, updateDownstream: boolean = true): void {
    this._startTime = time;
    if (updateDownstream) {
      this.updateDownstreamStartTimes();
    }
  }

  getStartTime(): number {
    return this._startTime;
  }

  onBind(): void {
    // 在第一次绑定到Animate的时候触发
  }

  /**
   * 首次运行逻辑
   * 如果跳帧了就不一定会执行
   */
  onFirstRun(): void {
    // 首次运行逻辑
  }

  /**
   * 开始执行的时候调用
   * 如果跳帧了就不一定会执行
   */
  onStart(): void {
    if (!this._hasFirstRun) {
      this._hasFirstRun = true;
      // 获取上一步的属性值作为起始值
      this.fromProps = this.getLastProps();
      this.determineInterpolateUpdateFunction();
      this.onFirstRun();
    }
  }

  /**
   * 更新执行的时候调用
   * 如果跳帧了就不一定会执行
   */
  update(end: boolean, ratio: number, out: Record<string, any>): void {
    // TODO 需要修复，只有在开始的时候才调用
    this.onStart();
    if (!this.props || !this.propKeys) {
      return;
    }
    // 应用缓动函数
    const easedRatio = this.easing(ratio);
    this.interpolateUpdateFunctions.forEach((func, index) => {
      const key = this.propKeys[index];
      const fromValue = this.fromProps[key];
      const toValue = this.props[key];
      func(key, fromValue, toValue, easedRatio, this, this.target);
    });
    this.onUpdate(end, easedRatio, out);
  }

  onUpdate = (end: boolean, ratio: number, out: Record<string, any>): void => {
    // ...
  };

  /**
   * 结束执行的时候调用
   * 如果跳帧了就不一定会执行
   */
  onEnd(cb?: (animate: IAnimate, step: IStep) => void): void {
    if (cb) {
      this._endCb = cb;
    } else if (this._endCb) {
      this.target.setAttributes(this.props);
      this._endCb(this.animate, this);
    }
  }

  /**
   * 获取结束的属性，包含前序的终值，是merge过的
   * @returns
   */
  getEndProps(): Record<string, any> {
    return this.props;
  }

  /**
   * 获取开始的属性，是前序的终值
   * @returns
   */
  getFromProps(): Record<string, any> {
    return this.fromProps;
  }

  /**
   * 获取结束的属性，包含前序的终值，是merge过的，同getEndProps
   * @returns
   */
  getMergedEndProps(): Record<string, any> | void {
    return this.getEndProps();
  }
}
