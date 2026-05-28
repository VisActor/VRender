import {
  type IGraphic,
  type IAnimate,
  type IStep,
  type EasingType,
  type EasingTypeFunc,
  type IAnimateStepType
} from '@visactor/vrender-core';
import { ColorStore, ColorType } from '@visactor/vrender-core/color-string';
import { Generator } from '@visactor/vrender-core/common/generator';
import { AttributeUpdateType } from '@visactor/vrender-core/event/constant';
import { Easing } from './utils/easing';
import { commonInterpolateUpdate, interpolateUpdateStore } from './interpolate/store';
import { isString } from '@visactor/vutils';
import { applyAnimationTransientAttributes } from './custom/transient';

function noop() {
  //...
}

function includesKey(keys: string[], key: string): boolean {
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === key) {
      return true;
    }
  }
  return false;
}

export class Step implements IStep {
  id: number;
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

  syncAttributeUpdate: () => void;

  constructor(type: IAnimateStepType, props: Record<string, any>, duration: number, easing: EasingType) {
    this.type = type;
    this.props = props;
    this.duration = duration;
    // 设置缓动函数
    if (easing) {
      this.easing = typeof easing === 'function' ? easing : Easing[easing] ?? Easing.linear;
    } else {
      this.easing = Easing.linear;
    }
    if (type === 'wait') {
      this.onUpdate = noop;
    }
    this.id = Generator.GenAutoIncrementId();
    this.syncAttributeUpdate = noop;
  }

  bind(target: IGraphic, animate: IAnimate): void {
    this.target = target;
    this.animate = animate;
    this.onBind();
    this.syncAttributeUpdate();
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
        const from = this.fromProps[key];
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
          funcs.push((interpolateUpdateStore as any)[key === 'fill' ? 'fillPure' : 'strokePure']);
        } else if ((interpolateUpdateStore as any)[key]) {
          funcs.push((interpolateUpdateStore as any)[key]);
        } else {
          funcs.push(commonInterpolateUpdate);
        }
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
    if (this.target.type === 'glyph') {
      this.syncAttributeUpdate = this._syncAttributeUpdate;
    }
  }

  _syncAttributeUpdate = (): void => {
    (this.target as any).addUpdateShapeAndBoundsTag?.();
    (this.target as any).addUpdatePositionTag?.();
    (this.target as any).onAttributeUpdate?.({ type: AttributeUpdateType.ANIMATE_UPDATE });
  };

  protected runInterpolateUpdate(fromProps: Record<string, any>, toProps: Record<string, any>, ratio: number): void {
    if (this.animate.interpolateUpdateFunction) {
      this.animate.interpolateUpdateFunction(fromProps, toProps, ratio, this, this.target);
      return;
    }

    const funcs = this.interpolateUpdateFunctions;
    const propKeys = this.propKeys;
    if (!funcs || !propKeys) {
      return;
    }
    for (let index = 0; index < funcs.length; index++) {
      const key = propKeys[index];
      const fromValue = fromProps[key];
      const toValue = toProps[key];
      funcs[index](key, fromValue, toValue, ratio, this, this.target);
    }
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
      const startProps = this.animate.getStartProps();
      this.propKeys &&
        this.propKeys.forEach(key => {
          this.fromProps[key] = this.fromProps[key] ?? startProps[key];
        });
      this.determineInterpolateUpdateFunction();
      this.tryPreventConflict();
      this.trySyncStartProps();
      this.onFirstRun();
    }
  }

  protected tryPreventConflict(): void {
    // 屏蔽掉之前动画冲突的属性
    const animate = this.animate;
    const target = this.target;
    const forEachTrackedAnimate =
      (target as any).forEachTrackedAnimate?.bind(target) ??
      ((cb: (a: any) => void) => {
        target.animates?.forEach(cb);
      });

    const propKeys = this.propKeys;
    forEachTrackedAnimate((a: any) => {
      if (a === animate || a.priority > animate.priority || a.priority === Infinity) {
        return;
      }
      const fromProps = a.getStartProps();
      let conflictKeys: string[] | null = null;
      for (let i = 0; i < propKeys.length; i++) {
        const key = propKeys[i];
        if (fromProps[key] != null) {
          (conflictKeys ?? (conflictKeys = [])).push(key);
        }
      }
      if (conflictKeys) {
        a.preventAttrs(conflictKeys);
      }
    });
  }

  protected removeKeysFromRecord<T extends Record<string, any> | undefined>(record: T, keys: string[]): T {
    if (!record) {
      return record;
    }

    let hasBlockedKey = false;
    for (const key in record) {
      if (Object.prototype.hasOwnProperty.call(record, key) && includesKey(keys, key)) {
        hasBlockedKey = true;
        break;
      }
    }
    if (!hasBlockedKey) {
      return record;
    }

    const nextRecord: Record<string, any> = {};
    for (const key in record) {
      if (Object.prototype.hasOwnProperty.call(record, key) && !includesKey(keys, key)) {
        nextRecord[key] = record[key];
      }
    }
    return nextRecord as T;
  }

  /**
   * 删除自身属性，会直接从props等内容里删除掉
   */
  deleteSelfAttr(key: string): void {
    this.deleteSelfAttrs([key]);
  }

  deleteSelfAttrs(keys: string[]): void {
    if (!keys?.length) {
      return;
    }

    this.props = this.removeKeysFromRecord(this.props, keys);
    this.fromProps = this.removeKeysFromRecord(this.fromProps, keys);
    this.fromParsedProps = this.removeKeysFromRecord(this.fromParsedProps, keys);
    this.toParsedProps = this.removeKeysFromRecord(this.toParsedProps, keys);

    if (this.propKeys?.length) {
      const funcs = this.interpolateUpdateFunctions;
      let writeIndex = 0;
      for (let readIndex = 0; readIndex < this.propKeys.length; readIndex++) {
        const propKey = this.propKeys[readIndex];
        if (includesKey(keys, propKey)) {
          continue;
        }
        if (writeIndex !== readIndex) {
          this.propKeys[writeIndex] = propKey;
          if (funcs) {
            funcs[writeIndex] = funcs[readIndex];
          }
        }
        writeIndex++;
      }
      this.propKeys.length = writeIndex;
      if (funcs) {
        funcs.length = writeIndex;
      }
    }
  }

  /**
   * 尝试同步startProps，因为当前animate的startProps仅包含当前animate的信息，不排除过程中有其他animate的干扰
   * 所以为了避免属性突变，需要确保startProps的属性值是最新的
   */
  trySyncStartProps(): void {
    this.propKeys.forEach(key => {
      this.fromProps[key] = this.animate.target.getComputedAttribute(key);
    });
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
    this.runInterpolateUpdate(this.fromProps, this.props, easedRatio);
    this.onUpdate(end, easedRatio, out);
    this.syncAttributeUpdate();
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    // ...
  }

  /**
   * 结束执行的时候调用
   * 如果跳帧了就不一定会执行
   */
  onEnd(cb?: (animate: IAnimate, step: IStep) => void): void {
    if (cb) {
      this._endCb = cb;
    } else if (this._endCb) {
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

  stop(): void {
    // ...
  }

  release(): void {
    // ...
  }
}

export class WaitStep extends Step {
  constructor(type: IAnimateStepType, props: Record<string, any>, duration: number, easing: EasingType) {
    super(type, props, duration, easing);
  }

  onStart(): void {
    super.onStart();

    const fromProps = this.getFromProps();
    applyAnimationTransientAttributes(this.target, fromProps, AttributeUpdateType.ANIMATE_START);
  }

  update(end: boolean, ratio: number, out: Record<string, any>): void {
    this.onStart();
    // 其他的不执行
  }

  determineInterpolateUpdateFunction(): void {
    return;
  }
}
