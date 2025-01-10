import type {
  EasingType,
  EasingTypeFunc,
  IAnimate,
  IAnimateStepType,
  IAnimateTarget,
  ICustomAnimate,
  IGraphic,
  IStep,
  IStepConfig,
  ISubAnimate,
  ITimeline
} from '../interface';
import { AnimateMode, AnimateStatus, AnimateStepType, AttributeUpdateType } from '../common/enums';
import { Easing } from './easing';
import { Logger, max } from '@visactor/vutils';
import { defaultTimeline } from './timeline';
import { Generator } from '../common/generator';

// 参考TweenJS
// https://github.com/CreateJS/TweenJS/tree/master/src/tweenjs
/**
 * The MIT License (MIT)

  Copyright (c) 2014 gskinner.com, inc.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
 */
export abstract class ACustomAnimate<T> implements ICustomAnimate {
  declare from: T;
  declare to: T;
  declare duration: number;
  declare easing: EasingType;
  declare params: any;
  declare target: IAnimateTarget;
  declare updateCount: number;
  declare subAnimate: ISubAnimate;
  declare step?: IStep;
  declare mode?: AnimateMode;

  // 用于判断是否一致
  declare _endProps?: any;
  declare _mergedEndProps?: any;

  constructor(from: T, to: T, duration: number, easing: EasingType, params?: any) {
    this.from = from;
    this.to = to;
    this.duration = duration;
    this.easing = easing;
    this.params = params;
    this.updateCount = 0;
  }

  bind(target: IAnimateTarget, subAni: ISubAnimate) {
    this.target = target;
    this.subAnimate = subAni;
    this.onBind();
  }

  // 在第一次调用的时候触发
  onBind() {
    return;
  }

  // 第一次执行的时候调用
  onFirstRun() {
    return;
  }

  // 开始执行的时候调用（如果有循环，那每个周期都会调用）
  onStart() {
    return;
  }

  // 结束执行的时候调用（如果有循环，那每个周期都会调用）
  onEnd() {
    return;
  }

  getEndProps(): Record<string, any> | void {
    return this.to;
  }

  getFromProps(): Record<string, any> | void {
    return this.from;
  }

  getMergedEndProps(): Record<string, any> | void {
    const thisEndProps = this.getEndProps();
    if (thisEndProps) {
      if (this._endProps === thisEndProps) {
        return this._mergedEndProps;
      }
      this._endProps = thisEndProps;
      this._mergedEndProps = Object.assign({}, this.step.prev.getLastProps() ?? {}, thisEndProps);
      return;
    }
    return this.step.prev ? this.step.prev.getLastProps() : thisEndProps;
  }

  // abstract getFromValue(key: string): any;
  // abstract getToValue(key: string): any;

  abstract onUpdate(end: boolean, ratio: number, out: Record<string, any>): void;

  update(end: boolean, ratio: number, out: Record<string, any>): void {
    if (this.updateCount === 0) {
      this.onFirstRun();
      // out添加之前的props
      const props = this.step.getLastProps();
      Object.keys(props).forEach(k => {
        if (this.subAnimate.animate.validAttr(k)) {
          out[k] = props[k];
        }
      });
    }
    this.updateCount += 1;
    this.onUpdate(end, ratio, out);
    if (end) {
      this.onEnd();
    }
  }
}

export class CbAnimate extends ACustomAnimate<null> {
  cb: () => void;

  constructor(cb: () => void) {
    super(null, null, 0, 'linear');
    this.cb = cb;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    return;
  }

  onStart(): void {
    this.cb();
  }
}

type InterpolateFunc = (
  key: string,
  ratio: number,
  from: any,
  to: any,
  target: IAnimateTarget,
  out: Record<string, any>
) => boolean;

export class Animate implements IAnimate {
  static mode: AnimateMode = AnimateMode.NORMAL;
  declare target: IAnimateTarget;
  declare timeline: ITimeline;
  declare nextAnimate?: IAnimate;
  declare prevAnimate?: IAnimate;
  // 当前Animate的状态，正常，暂停，结束
  declare status: AnimateStatus;
  declare readonly id: string | number;
  // 开始时间
  protected declare _startTime: number;
  protected declare _duringTime: number;
  declare subAnimates: SubAnimate[];
  declare tailAnimate: SubAnimate;

  // 绝对的位置
  declare rawPosition: number;
  // 时间倍速缩放
  declare timeScale: number;

  declare interpolateFunc: (key: string, ratio: number, from: any, to: any, nextAttributes: any) => boolean;

  declare _onStart?: (() => void)[];
  declare _onFrame?: ((step: IStep, ratio: number) => void)[];
  declare _onEnd?: (() => void)[];
  declare _onRemove?: (() => void)[];
  declare _preventAttrs?: Set<string>;
  static interpolateMap: Map<string, InterpolateFunc> = new Map();
  slience?: boolean;

  constructor(
    id: string | number = Generator.GenAutoIncrementId(),
    timeline: ITimeline = defaultTimeline,
    slience?: boolean
  ) {
    this.id = id;
    this.timeline = timeline || defaultTimeline;
    this.status = AnimateStatus.INITIAL;
    this.tailAnimate = new SubAnimate(this);
    this.subAnimates = [this.tailAnimate];
    this.timeScale = 1;
    this.rawPosition = -1;
    this._startTime = 0;
    this._duringTime = 0;
    this.timeline.addAnimate(this);
    this.slience = slience;
  }

  setTimeline(timeline: ITimeline) {
    if (timeline === this.timeline) {
      return;
    }
    this.timeline.removeAnimate(this, false);
    timeline.addAnimate(this);
  }

  getStartTime(): number {
    return this._startTime;
  }

  getDuration(): number {
    return this.subAnimates.reduce((t, subAnimate) => t + subAnimate.totalDuration, 0);
  }

  after(animate: IAnimate) {
    const t = animate.getDuration();
    this._startTime = t;
    return this;
  }

  afterAll(list: IAnimate[]) {
    let maxT = -Infinity;
    list.forEach(a => {
      maxT = max(a.getDuration(), maxT);
    });
    this._startTime = maxT;
    return this;
  }

  parallel(animate: IAnimate) {
    this._startTime = animate.getStartTime();
    return this;
  }

  static AddInterpolate(name: string, cb: InterpolateFunc) {
    Animate.interpolateMap.set(name, cb);
  }

  play(customAnimate: ICustomAnimate) {
    this.tailAnimate.play(customAnimate);
    // todo: 考虑使用绑定的ticker执行
    if (this.target) {
      const stage = (this.target as IGraphic).stage;
      stage && stage.renderNextFrame();
    }
    if (this.subAnimates.length === 1 && this.tailAnimate.totalDuration === customAnimate.duration) {
      this.trySetAttribute(customAnimate.getFromProps(), customAnimate.mode);
    }
    return this;
  }

  trySetAttribute(attr: Record<string, any> | void, mode: AnimateMode = Animate.mode) {
    if (attr && mode & AnimateMode.SET_ATTR_IMMEDIATELY) {
      (this.target as any).setAttributes &&
        (this.target as any).setAttributes(attr, false, { type: AttributeUpdateType.ANIMATE_PLAY });
    }
  }

  runCb(cb: (a: IAnimate, step: IStep) => void) {
    // this.tailAnimate.runCb(cb);
    const customAnimate = new CbAnimate(() => {
      cb(this, customAnimate.step.prev);
    });
    this.tailAnimate.play(customAnimate);
    return this;
  }

  /**
   * 自定义插值，返回false表示没有匹配上
   * @param key
   * @param from
   * @param to
   */
  customInterpolate(
    key: string,
    ratio: number,
    from: any,
    to: any,
    target: IAnimateTarget,
    ret: Record<string, any>
  ): boolean {
    const func = Animate.interpolateMap.get(key) || Animate.interpolateMap.get('');
    if (!func) {
      return false;
    }
    return func(key, ratio, from, to, target, ret);
  }

  pause() {
    if (this.status === AnimateStatus.RUNNING) {
      this.status = AnimateStatus.PAUSED;
    }
  }

  resume() {
    if (this.status === AnimateStatus.PAUSED) {
      this.status = AnimateStatus.RUNNING;
    }
  }

  to(props: Record<string, any>, duration: number, easing: EasingType, params?: IStepConfig) {
    this.tailAnimate.to(props, duration, easing, params);
    // 默认开始动画
    // todo: 考虑使用绑定的ticker执行
    if (this.target) {
      const stage = (this.target as IGraphic).stage;
      stage && stage.renderNextFrame();
    }
    // if (this.subAnimates.length === 1 && this.tailAnimate.duration === duration) {
    //   this.trySetAttribute(props);
    // }
    return this;
  }
  from(props: Record<string, any>, duration: number, easing: EasingType, params?: IStepConfig) {
    this.tailAnimate.from(props, duration, easing, params);
    // todo: 考虑使用绑定的ticker执行
    if (this.target) {
      const stage = (this.target as IGraphic).stage;
      stage && stage.renderNextFrame();
    }
    return this;
  }
  wait(duration: number) {
    this.tailAnimate.wait(duration);
    // todo: 考虑使用绑定的ticker执行
    if (this.target) {
      const stage = (this.target as IGraphic).stage;
      stage && stage.renderNextFrame();
    }
    return this;
  }
  startAt(t: number) {
    this.tailAnimate.startAt(t);
    // todo: 考虑使用绑定的ticker执行
    if (this.target) {
      const stage = (this.target as IGraphic).stage;
      stage && stage.renderNextFrame();
    }
    return this;
  }

  loop(l: number) {
    this.tailAnimate.loop = l;
    // todo: 考虑使用绑定的ticker执行
    if (this.target) {
      const stage = (this.target as IGraphic).stage;
      stage && stage.renderNextFrame();
    }
    return this;
  }

  reversed(r: boolean) {
    this.tailAnimate.reversed = r;
    // todo: 考虑使用绑定的ticker执行
    if (this.target) {
      const stage = (this.target as IGraphic).stage;
      stage && stage.renderNextFrame();
    }
    return this;
  }

  bounce(b: boolean) {
    this.tailAnimate.bounce = b;
    // todo: 考虑使用绑定的ticker执行
    if (this.target) {
      const stage = (this.target as IGraphic).stage;
      stage && stage.renderNextFrame();
    }
    return this;
  }

  subAnimate() {
    const sa = new SubAnimate(this, this.tailAnimate);
    this.tailAnimate = sa;
    this.subAnimates.push(sa);
    sa.bind(this.target);
    return this;
  }

  getStartProps(): Record<string, any> {
    return this.subAnimates[0].getStartProps();
  }

  getEndProps(): Record<string, any> {
    return this.tailAnimate.getEndProps();
  }

  depreventAttr(key: string) {
    if (!this._preventAttrs) {
      return;
    }
    this._preventAttrs.delete(key);
  }
  preventAttr(key: string) {
    if (!this._preventAttrs) {
      this._preventAttrs = new Set();
    }
    this._preventAttrs.add(key);
  }
  preventAttrs(keys: string[]) {
    keys.forEach(key => this.preventAttr(key));
  }
  validAttr(key: string): boolean {
    if (!this._preventAttrs) {
      return true;
    }
    return !this._preventAttrs.has(key);
  }

  bind(target: IAnimateTarget) {
    this.target = target;

    if (this.target.onAnimateBind && !this.slience) {
      this.target.onAnimateBind(this);
    }

    this.subAnimates.forEach(sa => {
      sa.bind(target);
    });
    return this;
  }

  advance(delta: number) {
    // startTime之前的时间不计入耗时
    if (this._duringTime < this._startTime) {
      if (this._duringTime + delta * this.timeScale < this._startTime) {
        this._duringTime += delta * this.timeScale;
        return;
      }
      delta = this._duringTime + delta * this.timeScale - this._startTime;
      this._duringTime = this._startTime;
    }
    // 执行advance
    if (this.status === AnimateStatus.INITIAL) {
      this.status = AnimateStatus.RUNNING;
      this._onStart && this._onStart.forEach(cb => cb());
    }
    const end = this.setPosition(Math.max(this.rawPosition, 0) + delta * this.timeScale);
    if (end && this.status === AnimateStatus.RUNNING) {
      this.status = AnimateStatus.END;
      this._onEnd && this._onEnd.forEach(cb => cb());
    }
  }

  setPosition(rawPosition: number): boolean {
    let d = 0;
    let sa: SubAnimate | undefined;
    const prevRawPos = this.rawPosition;
    const maxRawPos = this.subAnimates.reduce((a, b) => a + b.totalDuration, 0);

    if (rawPosition < 0) {
      rawPosition = 0;
    }

    const end = rawPosition >= maxRawPos;

    if (end) {
      rawPosition = maxRawPos;
    }

    if (rawPosition === prevRawPos) {
      return end;
    }

    // 查找对应的subAnimate
    for (let i = 0; i < this.subAnimates.length; i++) {
      sa = this.subAnimates[i];
      if (d + sa.totalDuration >= rawPosition) {
        break;
      } else {
        d += sa.totalDuration;
        sa = undefined;
      }
    }
    this.rawPosition = rawPosition;
    sa.setPosition(rawPosition - d);

    return end;
  }

  onStart(cb: () => void) {
    if (!this._onStart) {
      this._onStart = [];
    }
    this._onStart.push(cb);
  }
  onEnd(cb: () => void) {
    if (!this._onEnd) {
      this._onEnd = [];
    }
    this._onEnd.push(cb);
  }
  onRemove(cb: () => void) {
    if (!this._onRemove) {
      this._onRemove = [];
    }
    this._onRemove.push(cb);
  }
  onFrame(cb: (step: IStep, ratio: number) => void) {
    if (!this._onFrame) {
      this._onFrame = [];
    }
    this._onFrame.push(cb);
  }
  release() {
    this.status = AnimateStatus.END;
    return;
  }

  stop(nextVal?: 'start' | 'end' | Record<string, any>) {
    if (!nextVal) {
      this.target.onStop();
    }
    if (nextVal === 'start') {
      this.target.onStop(this.getStartProps());
    } else if (nextVal === 'end') {
      this.target.onStop(this.getEndProps());
    } else {
      this.target.onStop(nextVal);
    }
    this.release();
  }
}

// Animate.mode |= AnimateMode.SET_ATTR_IMMEDIATELY;

export class SubAnimate implements ISubAnimate {
  declare target: IAnimateTarget;
  declare animate: IAnimate;
  // 默认的初始step，一定存在，且stepHead的props一定保存整个subAnimate阶段所有属性的最初
  protected declare stepHead: Step;
  protected declare stepTail: Step;
  // 结束时反转动画
  declare bounce: boolean;
  // 是否reverse
  declare reversed: boolean;
  // 循环次数，0为执行一次，1为执行两次，Infinity为无限循环
  declare loop: number;
  // 持续时间，不包括循环
  declare duration: number;
  // 位置，在[0, duration]之间
  declare position: number;
  // 绝对的位置，在[0, loops * duration]之间
  declare rawPosition: number;
  declare dirty: boolean;

  declare _totalDuration: number;
  declare _startAt: number;
  declare _lastStep: IStep;
  declare _deltaPosition: number;

  get totalDuration(): number {
    this.calcAttr();
    return this._totalDuration + this._startAt;
  }

  constructor(animate: IAnimate, lastSubAnimate?: SubAnimate) {
    this.rawPosition = -1;
    this.position = 0;
    this.loop = 0;
    this.duration = 0;
    this.animate = animate;
    if (lastSubAnimate) {
      this.stepHead = new Step(0, 0, Object.assign({}, lastSubAnimate.stepTail.props));
    } else {
      this.stepHead = new Step(0, 0, {});
    }
    this.stepTail = this.stepHead;
    this.dirty = true;
    this._startAt = 0;
  }

  // 计算按需计算的属性
  protected calcAttr() {
    if (!this.dirty) {
      return;
    }

    this._totalDuration = this.duration * (this.loop + 1);
  }

  bind(target: IAnimateTarget) {
    this.target = target;
    return this;
  }

  play(customAnimate: ICustomAnimate) {
    let duration = customAnimate.duration;
    if (duration == null || duration < 0) {
      duration = 0;
    }
    const easing = customAnimate.easing;
    const easingFunc = typeof easing === 'string' ? Easing[easing] : easing;
    const step = this._addStep(duration, null, easingFunc);
    step.type = AnimateStepType.customAnimate;
    this._appendProps(customAnimate.getEndProps(), step, false);
    this._appendCustomAnimate(customAnimate, step);
    return this;
  }

  // _appendPlayProps(step: IStep) {

  //   return;
  // }

  to(props: Record<string, any>, duration: number, easing: EasingType, params?: IStepConfig) {
    if (duration == null || duration < 0) {
      duration = 0;
    }

    const easingFunc = typeof easing === 'string' ? Easing[easing] : easing;

    const step = this._addStep(duration, null, easingFunc);
    step.type = AnimateStepType.to;
    this._appendProps(props, step, params ? params.tempProps : false);
    // this._appendPlayProps(step);

    if (!step.propKeys) {
      step.propKeys = Object.keys(step.props);
    }
    if (!(params && params.noPreventAttrs)) {
      this.target.animates.forEach(a => {
        if (a.id !== this.animate.id) {
          a.preventAttrs(step.propKeys);
        }
      });
    }
    return this;
  }

  from(props: Record<string, any>, duration: number, easing: EasingType, params?: IStepConfig) {
    this.to(props, 0, easing, params);
    const toProps = {};
    if (!this.stepTail.propKeys) {
      this.stepTail.propKeys = Object.keys(this.stepTail.props);
    }
    this.stepTail.propKeys.forEach(k => {
      toProps[k] = this.getLastPropByName(k, this.stepTail);
    });
    this.to(toProps, duration, easing, params);
    this.stepTail.type = AnimateStepType.from;
  }

  startAt(t: number) {
    if (t < 0) {
      t = 0;
    }
    this._startAt = t;
    return this;
  }

  getStartProps() {
    return this.stepHead?.props;
  }

  getEndProps() {
    return this.stepTail.props;
  }

  getLastStep() {
    return this._lastStep;
  }

  wait(duration: number) {
    if (duration > 0) {
      const step = this._addStep(+duration, null);

      step.type = AnimateStepType.wait;
      // TODO 这里如果跳帧的话会存在bug
      if (step.prev.customAnimate) {
        step.props = step.prev.customAnimate.getEndProps();
      } else {
        step.props = step.prev.props;
      }
      if (this.target.onAddStep) {
        this.target.onAddStep(step);
      }
      // this._appendPlayProps(step);
    }
    return this;
  }

  protected _addStep(duration: number, props: any, easingFunc?: EasingTypeFunc) {
    const step = new Step(this.duration, duration, props, easingFunc);
    this.duration += duration;
    this.stepTail.append(step);
    this.stepTail = step;
    return step;
  }

  protected _appendProps(props: any, step: Step, tempProps?: boolean) {
    if (tempProps) {
      step.props = props;
    } else {
      // todo: 是否需要深拷贝props
      step.props = Object.assign({}, props);
    }
    let lastStep = step.prev;
    const _props = step.props;
    // 将undefined的属性设置到默认值
    if (!step.propKeys) {
      step.propKeys = Object.keys(step.props);
    }
    step.propKeys.forEach(k => {
      if (step.props[k] === undefined) {
        step.props[k] = this.target.getDefaultAttribute(k);
      }
    });
    // 拷贝之前的step阶段属性
    while (lastStep.prev) {
      if (lastStep.props) {
        if (!lastStep.propKeys) {
          lastStep.propKeys = Object.keys(lastStep.props);
        }
        lastStep.propKeys.forEach(key => {
          if (_props[key] === undefined) {
            _props[key] = lastStep.props[key];
          }
        });
      }
      // 重置propKeys
      step.propKeys = Object.keys(step.props);
      lastStep = lastStep.prev;
    }

    // 设置最初的props属性
    const initProps = this.stepHead.props;
    if (!step.propKeys) {
      step.propKeys = Object.keys(_props);
    }
    step.propKeys.forEach(key => {
      if (initProps[key] === undefined) {
        const parentAnimateInitProps = this.animate.getStartProps();
        initProps[key] = parentAnimateInitProps[key] = this.target.getComputedAttribute(key);
      }
    });

    if (this.target.onAddStep) {
      this.target.onAddStep(step);
    }
  }

  protected _appendCustomAnimate(customAnimate: ICustomAnimate, step: Step) {
    step.customAnimate = customAnimate;
    customAnimate.step = step;
    customAnimate.bind(this.target, this);
  }

  setPosition(rawPosition: number) {
    const d = this.duration;
    const loopCount = this.loop;
    const prevRawPos = this.rawPosition;
    let end = false;
    let loop: number; // 当前是第几次循环
    let position: number; // 当前周期的时间
    const startAt = this._startAt ?? 0;

    if (rawPosition < 0) {
      rawPosition = 0;
    }
    if (rawPosition < startAt) {
      this.rawPosition = rawPosition;
      return false;
    }
    rawPosition = rawPosition - startAt;
    if (d <= 0) {
      // 如果不用执行，跳过
      end = true;
      // 小于0的话，直接return，如果等于0，那还是得走动画逻辑，将end属性设置上去
      if (d < 0) {
        return end;
      }
    }
    loop = Math.floor(rawPosition / d);
    position = rawPosition - loop * d;

    // 计算rawPosition
    end = rawPosition >= loopCount * d + d;
    // 如果结束，跳过
    if (end) {
      position = d;
      loop = loopCount;
      rawPosition = position * loop + d;
    }

    if (rawPosition === prevRawPos) {
      return end;
    }

    // reverse动画
    const rev = !this.reversed !== !(this.bounce && loop % 2);
    if (rev) {
      position = d - position;
    }

    this._deltaPosition = position - this.position;
    this.position = position;
    this.rawPosition = rawPosition + startAt;

    this.updatePosition(end, rev);

    return end;
  }

  protected updatePosition(end: boolean, rev: boolean) {
    if (!this.stepHead) {
      return;
    }
    let step = this.stepHead.next;
    const position = this.position;
    const duration = this.duration;
    if (this.target && step) {
      let stepNext = step.next;
      while (stepNext && stepNext.position <= position) {
        step = stepNext;
        stepNext = step.next;
      }
      let ratio = end ? (duration === 0 ? 1 : position / duration) : (position - step.position) / step.duration; // TODO: revisit this.
      if (step.easing) {
        ratio = step.easing(ratio);
      }
      // 判断这次和上次过程中是否经历了自定义step，如果跳过了自定义step那么执行自定义step的onEnd
      this.tryCallCustomAnimateLifeCycle(step, this._lastStep || (rev ? this.stepTail : this.stepHead), rev);
      // if (step !== this._lastStep) {
      //   if (this._deltaPosition > 0) {
      //     let _step = step.prev;
      //     while (_step && _step !== this._lastStep) {
      //       if (_step.customAnimate) {
      //         _step.customAnimate.onEnd();
      //       }
      //       _step = _step.prev;
      //     }
      //     if (_step && _step.customAnimate) {
      //       _step.customAnimate.onEnd();
      //     }
      //   } else if (this._deltaPosition < 0) {
      //     let _step = step.next;
      //     while (_step && _step !== this._lastStep) {
      //       if (_step.customAnimate) {
      //         _step.customAnimate.onEnd();
      //       }
      //       _step = _step.next;
      //     }
      //     if (_step && _step.customAnimate) {
      //       _step.customAnimate.onEnd();
      //     }
      //   }
      // }
      this.updateTarget(step, ratio, end);
      this._lastStep = step;

      this.animate._onFrame && this.animate._onFrame.forEach(cb => cb(step, ratio));
    }
  }

  // 如果动画卡顿跳过了自定义动画，那么尝试执行自定义动画的生命周期
  tryCallCustomAnimateLifeCycle(step: IStep, lastStep: IStep, rev: boolean) {
    if (step === lastStep) {
      return;
    }
    if (rev) {
      let _step = lastStep.prev;
      while (_step && _step !== step) {
        if (_step.customAnimate) {
          _step.customAnimate.onStart && _step.customAnimate.onStart();
          _step.customAnimate.onEnd && _step.customAnimate.onEnd();
        }
        _step = step.prev;
      }
      // 执行lastStep的onEnd和currentStep的onStart
      if (lastStep && lastStep.customAnimate) {
        lastStep.customAnimate.onEnd && lastStep.customAnimate.onEnd();
      }
      if (step && step.customAnimate) {
        step.customAnimate.onStart && step.customAnimate.onStart();
      }
    } else {
      let _step = lastStep.next;
      while (_step && _step !== step) {
        if (_step.customAnimate) {
          _step.customAnimate.onStart && _step.customAnimate.onStart();
          _step.customAnimate.onEnd && _step.customAnimate.onEnd();
        }
        _step = _step.next;
      }
      // 执行lastStep的onEnd和currentStep的onStart
      if (lastStep && lastStep.customAnimate) {
        lastStep.customAnimate.onEnd && lastStep.customAnimate.onEnd();
      }
      if (step && step.customAnimate) {
        step.customAnimate.onStart && step.customAnimate.onStart();
      }
    }
  }

  /**
   * 获取这个属性的上一个值
   * @param name
   * @param step
   * @returns
   */
  getLastPropByName(name: string, step: Step): any {
    let lastStep = step.prev;
    while (lastStep) {
      if (lastStep.props && lastStep.props[name] !== undefined) {
        return lastStep.props[name];
      } else if (lastStep.customAnimate) {
        const val = lastStep.customAnimate.getEndProps()[name];
        if (val !== undefined) {
          return val;
        }
      }
      lastStep = lastStep.prev;
    }

    Logger.getInstance().warn('未知错误，step中找不到属性');
    return step.props[name];
  }

  protected updateTarget(step: Step, ratio: number, end: boolean) {
    if (step.props == null && step.customAnimate == null) {
      return;
    }
    this.target.onStep(this, this.animate, step, ratio, end);
  }
}

// export class Animate implements IAnimate {
//   declare target: IAnimateTarget;
//   declare timeline: ITimeline;
//   protected declare stepHead: Step;
//   protected declare stepTail: Step;
//   declare nextAnimate?: Animate;
//   declare prevAnimate?: Animate;
//   // 结束时反转动画
//   declare bounce: boolean;
//   // 是否reverse
//   declare reversed: boolean;
//   // 循环次数，0为执行一次，1为执行两次，Infinity为无限循环
//   declare loop: number;
//   // 持续时间，不包括循环
//   declare duration: number;
//   // 当前Animate的状态，正常，暂停，结束
//   declare status: AnimateStatus;
//   // 位置，在[0, duration]之间
//   declare position: number;
//   // 绝对的位置，在[0, loops * duration]之间
//   declare rawPosition: number;
//   // 开始时间
//   protected declare _startAt: number;
//   // 时间的缩放，例如2表示2倍速
//   declare timeScale: number;
//   declare props: Record<string, any>;
//   declare readonly id: string | number;

//   protected declare _onStart?: (() => void)[];
//   protected declare _onFrame?: ((step: IStep, ratio: number) => void)[];
//   protected declare _onEnd?: (() => void)[];
//   declare _onRemove?: (() => void)[];
//   declare _preventAttrs?: Set<string>;

//   constructor(id: string | number = Generator.GenAutoIncrementId(), timeline: ITimeline = defaultTimeline) {
//     this.timeline = timeline;
//     this.status = AnimateStatus.INITIAL;
//     this.rawPosition = -1;
//     this.position = 0;
//     this.loop = 0;
//     this.timeline.addAnimate(this);
//     this.timeScale = 1;
//     this.id = id;
//     this.props = {};
//     this.stepHead = new Step(0, 0, {});
//     this.stepTail = this.stepHead;
//   }

//   preventAttr(key: string) {
//     if (!this._preventAttrs) {
//       this._preventAttrs = new Set();
//     }
//     this._preventAttrs.add(key);
//   }
//   preventAttrs(keys: string[]) {
//     keys.forEach(key => this.preventAttr(key));
//   }
//   validAttr(key: string): boolean {
//     if (!this._preventAttrs) {
//       return true;
//     }
//     return !this._preventAttrs.has(key);
//   }

//   getLastPropByName(name: string, step: Step): any {
//     let lastStep = step.prev;
//     while (lastStep) {
//       if (lastStep.props && lastStep.props[name] !== undefined) {
//         return lastStep.props[name];
//       }
//       lastStep = lastStep.prev;
//     }
//     let val = this.props[name];
//     if (!val) {
//       console.warn('未知错误，step中找不到属性');
//       val = this.target.getComputedAttribute(name);
//       this.props[name] = val;
//     }

//     return val;
//   }

//   bind(target: IAnimateTarget) {
//     this.target = target;
//     this.duration = 0;
//     return this;
//   }

//   startAt(t: number) {
//     if (t < 0) {
//       return this;
//     }
//     this._startAt = t;
//     return this;
//   }

//   to(props: Record<string, any>, duration: number, easing: EasingType, params?: IStepConfig) {
//     if (duration == null || duration < 0) {
//       duration = 0;
//     }

//     const easingFunc = typeof easing === 'string' ? Easing[easing] : easing;

//     const step = this._addStep(duration, null, easingFunc);
//     this._appendProps(props, step, params ? params.tempProps : false);
//     return this;
//   }

//   wait(duration: number) {
//     if (duration > 0) {
//       const step = this._addStep(+duration, null);
//       if (step.prev) {
//         step.props = step.prev.props;
//       }
//       if (this.target.onAddStep) {
//         this.target.onAddStep(step);
//       }
//     }
//     return this;
//   }

//   protected _addStep(duration: number, props: any, easingFunc?: EasingTypeFunc) {
//     const step = new Step(this.duration, duration, props, easingFunc);
//     this.duration += duration;
//     this.stepTail.append(step);
//     this.stepTail = step;
//     return step;
//   }

//   protected _appendProps(props: any, step: Step, tempProps?: boolean) {
//     if (tempProps) {
//       step.props = props;
//     } else {
//       // todo: 是否需要深拷贝props
//       step.props = Object.assign({}, props);
//     }
//     let lastStep = step.prev;
//     const _props = step.props;
//     // 拷贝之前的step阶段属性
//     while (lastStep.prev) {
//       if (lastStep.props) {
//         if (!lastStep.propKeys) {
//           lastStep.propKeys = Object.keys(lastStep.props);
//         }
//         lastStep.propKeys.forEach(key => {
//           if (_props[key] === undefined) {
//             _props[key] = lastStep.props[key];
//           }
//         });
//       }
//       lastStep = lastStep.prev;
//     }

//     // 设置最初的props属性
//     const initProps = this.stepHead.props;
//     if (!step.propKeys) {
//       step.propKeys = Object.keys(_props);
//       step.propKeys.forEach(key => {
//         initProps[key] = this.target.getComputedAttribute(key);
//       });
//     }

//     if (this.target.onAddStep) {
//       this.target.onAddStep(step);
//     }
//   }

//   advance(delta: number) {
//     if (this.status === AnimateStatus.INITIAL) {
//       this.status = AnimateStatus.RUNNING;
//       this._onStart && this._onStart.forEach(cb => cb());
//     }
//     const end = this.setPosition(this.rawPosition + delta * this.timeScale);
//     if (end && this.status === AnimateStatus.RUNNING) {
//       this.status = AnimateStatus.END;
//       this._onEnd && this._onEnd.forEach(cb => cb());
//     }
//   }

//   setPosition(rawPosition: number) {
//     const d = this.duration;
//     const loopCount = this.loop;
//     const prevRawPos = this.rawPosition;
//     let end = false;
//     let loop: number; // 当前是第几次循环
//     let position: number; // 当前周期的时间
//     const startAt = this._startAt ?? 0;

//     if (rawPosition < 0) {
//       rawPosition = 0;
//     }
//     if (rawPosition < startAt) {
//       this.rawPosition = rawPosition;
//       return false;
//     }
//     rawPosition = rawPosition - startAt;
//     if (d <= 0) {
//       // 如果不用执行，跳过
//       end = true;
//       return end;
//     }
//     loop = Math.floor(rawPosition / d);
//     position = rawPosition - loop * d;

//     // 计算rawPosition
//     end = rawPosition >= loopCount * d + d;
//     // 如果结束，跳过
//     if (end) {
//       position = d;
//       loop = loopCount;
//       rawPosition = position * loop + d;
//     }

//     if (rawPosition === prevRawPos) {
//       return end;
//     }

//     // reverse动画
//     const rev = !this.reversed !== !(this.bounce && loop % 2);
//     if (rev) {
//       position = d - position;
//     }

//     this.position = position;
//     this.rawPosition = rawPosition + startAt;

//     this.updatePosition(end);

//     return end;
//   }

//   protected updatePosition(end: boolean) {
//     if (!this.stepHead) {
//       return;
//     }
//     let step = this.stepHead;
//     const position = this.position;
//     const duration = this.duration;
//     if (this.target && step) {
//       let stepNext = step.next;
//       while (stepNext && stepNext.position <= position) {
//         step = step.next;
//         stepNext = step.next;
//       }
//       let ratio = end ? (duration === 0 ? 1 : position / duration) : (position - step.position) / step.duration; // TODO: revisit this.
//       if (step.easing) {
//         ratio = step.easing(ratio);
//       }
//       this.updateTarget(step, ratio, end);
//       this._onFrame && this._onFrame.forEach(cb => cb(step, ratio));
//     }
//   }

//   protected updateTarget(step: Step, ratio: number, end: boolean) {
//     if (step.props == null) {
//       return;
//     }
//     this.target.onStep(this, step, ratio, end);
//   }

//   onStart(cb: () => void) {
//     if (!this._onStart) {
//       this._onStart = [];
//     }
//     this._onStart.push(cb);
//   }
//   onEnd(cb: () => void) {
//     if (!this._onEnd) {
//       this._onEnd = [];
//     }
//     this._onEnd.push(cb);
//   }
//   onRemove(cb: () => void) {
//     if (!this._onRemove) {
//       this._onRemove = [];
//     }
//     this._onRemove.push(cb);
//   }
//   onFrame(cb: (step: IStep, ratio: number) => void) {
//     if (!this._onFrame) {
//       this._onFrame = [];
//     }
//     this._onFrame.push(cb);
//   }

//   getStartProps() {
//     return this.stepHead?.props;
//   }

//   getEndProps(target: Record<string, any> = {}) {
//     let step = this.stepHead;
//     while (step) {
//       if (step.props) {
//         Object.assign(target, step.props);
//       }
//       step = step.next;
//     }

//     return target;
//   }

//   stop(nextVal?: 'start' | 'end' | Record<string, any>) {
//     this.status = AnimateStatus.END;
//     if (!nextVal) {
//       this.target.onStop();
//     }
//     if (nextVal === 'start') {
//       this.target.onStop(this.getStartProps());
//     } else if (nextVal === 'end') {
//       this.target.onStop(this.getEndProps());
//     } else {
//       this.target.onStop(nextVal);
//     }
//   }

//   release() {
//     this.status = AnimateStatus.END;
//     return;
//   }
// }

class Step implements IStep {
  declare prev?: Step;
  // 持续时间
  declare duration: number;
  // 在animate中的位置
  declare position: number;
  declare next?: Step;
  declare props: any;
  // 保存解析后的props，用于性能优化
  declare parsedProps?: any;
  declare propKeys?: string[];
  declare easing?: EasingTypeFunc;
  declare customAnimate?: ICustomAnimate;
  // passive: boolean;
  // index: number;
  type: IAnimateStepType;

  constructor(position: number, duration: number, props?: any, easing?: EasingTypeFunc) {
    this.duration = duration;
    this.position = position;
    this.props = props;
    this.easing = easing;
  }

  append(step: Step) {
    step.prev = this;
    step.next = this.next;
    this.next = step;
  }

  getLastProps() {
    let step = this.prev;
    while (step) {
      if (step.props) {
        return step.props;
      } else if (step.customAnimate) {
        return step.customAnimate.getMergedEndProps();
      }
      step = step.prev as any;
    }
    return null;
  }
}
