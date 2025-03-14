import type { IAnimate, IStep } from './intreface/animate';
import type { EasingType } from './intreface/easing';
import { AnimateStatus, AnimateStepType } from './intreface/type';
import { Step } from './step';
import type { ITimeline } from './intreface/timeline';
import type { ICustomAnimate, IGraphic } from '@visactor/vrender-core';

let uniqueId = 0;

export class Animate implements IAnimate {
  readonly id: string | number;
  status: AnimateStatus = AnimateStatus.INITIAL;
  target: IGraphic;

  // 回调函数列表
  _onStart?: (() => void)[] = [];
  _onFrame?: ((step: IStep, ratio: number) => void)[] = [];
  _onEnd?: (() => void)[] = [];
  _onRemove?: (() => void)[] = [];

  // 时间控制
  private _timeline: ITimeline;
  private _startTime: number = 0;
  private _duration: number = 0;
  private _totalDuration: number = 0;

  // 动画控制
  private _reversed: boolean = false;
  private _loopCount: number = 0;
  private _bounce: boolean = false;

  // 链表头节点和尾节点
  private _firstStep: IStep | null = null;
  private _lastStep: IStep | null = null;

  // 初始属性和屏蔽的属性
  private _startProps: Record<string, any> = {};
  private _endProps: Record<string, any> = {};
  private _preventAttrs: Set<string> = new Set();

  protected currentTime: number = 0;

  constructor(id: string | number = uniqueId++) {
    this.id = id;
  }

  /**
   * 获取开始属性
   */
  getStartProps(): Record<string, any> {
    return this._startProps;
  }

  /**
   * 获取结束属性
   */
  getEndProps(): Record<string, any> {
    return this._endProps;
  }

  /**
   * 设置时间线
   */
  setTimeline(timeline: ITimeline): void {
    this._timeline = timeline;
  }

  /**
   * 获取时间线
   */
  getTimeline(): ITimeline {
    return this._timeline;
  }

  /**
   * 时间线属性访问器
   */
  get timeline(): ITimeline {
    return this._timeline;
  }

  /**
   * 绑定目标图形
   */
  bind(target: IGraphic): this {
    this.target = target;
    return this;
  }

  /**
   * 动画步骤：to
   * 添加一个to步骤，这会在当前状态到指定状态间进行插值
   */
  to(props: Record<string, any>, duration: number = 300, easing: EasingType = 'linear'): this {
    // 创建新的step
    const step = new Step(AnimateStepType.to, props, duration, easing, this);

    // 如果是第一个step
    if (!this._firstStep) {
      this._firstStep = step;
      this._lastStep = step;
    } else {
      // 添加到链表末尾
      this._lastStep.append(step);
      this._lastStep = step;
    }

    // 保存最终属性
    step.propKeys = step.propKeys || Object.keys(step.props);
    step.propKeys.forEach(key => {
      this._endProps[key] = step.props[key];
    });

    this.updateDuration();

    return this;
  }

  /**
   * 动画步骤：from
   * 添加一个from步骤，这会将目标属性先设置为指定值，然后过渡到当前状态
   * 【注意】这可能会导致动画跳变，请谨慎使用
   */
  from(props: Record<string, any>, duration: number = 300, easing: EasingType = 'linear'): this {
    // 创建新的step
    const step = new Step(AnimateStepType.from, props, duration, easing, this);

    // 如果是第一个step
    if (!this._firstStep) {
      this._firstStep = step;
      this._lastStep = step;
    } else {
      // 添加到链表末尾
      this._lastStep.append(step);
      this._lastStep = step;
    }

    this.updateDuration();

    return this;
  }

  /**
   * 暂停动画
   */
  pause(): void {
    if (this.status === AnimateStatus.RUNNING) {
      this.status = AnimateStatus.PAUSED;
    }
  }

  /**
   * 恢复动画
   */
  resume(): void {
    if (this.status === AnimateStatus.PAUSED) {
      this.status = AnimateStatus.RUNNING;
    }
  }

  /**
   * 注册开始回调
   */
  onStart(cb?: () => void): void {
    if (cb) {
      if (!this._onStart) {
        this._onStart = [];
      }
      this._onStart.push(cb);
    } else {
      this._onStart.forEach(cb => cb());
      // 设置开始属性，Animate不会重复执行start所以不需要判断firstStart
      Object.keys(this._endProps).forEach(key => {
        this._startProps[key] = this.target.getComputedAttribute(key);
      });
    }
  }

  /**
   * 注册结束回调
   */
  onEnd(cb?: () => void): void {
    if (cb) {
      if (!this._onEnd) {
        this._onEnd = [];
      }
      this._onEnd.push(cb);
    } else {
      this._onEnd.forEach(cb => cb());
    }
  }

  /**
   * 注册帧回调
   */
  onFrame(cb?: (step: IStep, ratio: number) => void): void {
    if (cb) {
      if (!this._onFrame) {
        this._onFrame = [];
      }
      this._onFrame.push(cb);
    }
  }

  /**
   * 屏蔽单个属性
   */
  preventAttr(key: string): void {
    this._preventAttrs.add(key);
  }

  /**
   * 屏蔽多个属性
   */
  preventAttrs(keys: string[]): void {
    keys.forEach(key => this._preventAttrs.add(key));
  }

  /**
   * 检查属性是否合法（未被屏蔽）
   */
  validAttr(key: string): boolean {
    return !this._preventAttrs.has(key);
  }

  /**
   * 运行自定义回调
   */
  runCb(cb: (a: IAnimate, step: IStep) => void): IAnimate {
    this._lastStep?.onEnd(cb);
    return this;
  }

  /**
   * 设置动画开始时间
   */
  startAt(t: number): this {
    this._startTime = t;

    return this;
  }

  /**
   * 自定义插值函数，返回false表示没有匹配上
   */
  customInterpolate(
    key: string,
    ratio: number,
    from: any,
    to: any,
    target: IGraphic,
    ret: Record<string, any>
  ): boolean {
    // 默认无自定义插值，可由子类重写
    return false;
  }

  /**
   * 自定义动画
   */
  play(customAnimate: ICustomAnimate): this {
    // 创建新的step
    const step = new Step(AnimateStepType.customAnimate, { customAnimate }, 0, 'linear', this);

    // 如果是第一个step
    if (!this._firstStep) {
      this._firstStep = step;
      this._lastStep = step;
    } else {
      // 添加到链表末尾
      this._lastStep.append(step);
      this._lastStep = step;
    }

    this.updateDuration();

    return this;
  }

  /**
   * 获取起始值，该起始值为animate的起始值，并不一定为step的起始值
   */
  getFromValue(): Record<string, any> {
    return this._startProps;
  }

  /**
   * 获取结束值
   */
  getToValue(): Record<string, any> {
    return this._endProps;
  }

  /**
   * 停止动画
   */
  stop(type?: 'start' | 'end' | Record<string, any>): void {
    if (this.status !== AnimateStatus.RUNNING) {
      return;
    }

    this.status = AnimateStatus.END;

    if (!this.target) {
      return;
    }

    if (type === 'start') {
      // 设置为开始状态
      this.target.setAttributes(this._startProps);
    } else if (type === 'end') {
      // 设置为结束状态
      this.target.setAttributes(this._endProps);
    } else if (type) {
      // 设置为自定义状态
      this.target.setAttributes(type);
    }
  }

  /**
   * 释放动画资源
   */
  release(): void {
    this.status = AnimateStatus.END;

    // 触发移除回调
    if (this._onRemove) {
      this._onRemove.forEach(cb => cb());
    }

    // 清空回调
    this._onStart = [];
    this._onFrame = [];
    this._onEnd = [];
    this._onRemove = [];
  }

  /**
   * 获取动画持续时间
   */
  getDuration(): number {
    return this._duration;
  }

  /**
   * 获取动画开始时间
   */
  getStartTime(): number {
    return this._startTime;
  }

  /**
   * 等待延迟
   */
  wait(delay: number): this {
    // 创建新的wait step
    const step = new Step(AnimateStepType.wait, {}, delay, 'linear', this);

    // 如果是第一个step
    if (!this._firstStep) {
      this._firstStep = step;
      this._lastStep = step;
    } else {
      // 添加到链表末尾
      this._lastStep.append(step);
      this._lastStep = step;
    }

    this.updateDuration();

    return this;
  }

  /**
   * 在所有动画完成后执行
   */
  afterAll(list: IAnimate[]): this {
    if (!list || list.length === 0) {
      return this;
    }

    // 计算所有动画结束的最大时间点
    let maxEndTime = 0;
    list.forEach(animate => {
      const endTime = animate.getStartTime() + animate.getDuration();
      maxEndTime = Math.max(maxEndTime, endTime);
    });

    // 设置当前动画的开始时间为最大结束时间
    return this.startAt(maxEndTime);
  }

  /**
   * 在指定动画完成后执行
   */
  after(animate: IAnimate): this {
    if (!animate) {
      return this;
    }

    // 计算指定动画结束的时间点
    const endTime = animate.getStartTime() + animate.getDuration();

    // 设置当前动画的开始时间为结束时间
    return this.startAt(endTime);
  }

  /**
   * 并行执行动画
   */
  parallel(animate: IAnimate): this {
    if (!animate) {
      return this;
    }

    // 设置指定动画的开始时间为当前动画的开始时间
    this.startAt(animate.getStartTime());

    return this;
  }

  /**
   * 设置动画是否反转
   */
  reversed(r: boolean): this {
    this._reversed = r;
    return this;
  }

  /**
   * 设置动画循环次数
   */
  loop(n: number): this {
    this._loopCount = n;
    return this;
  }

  /**
   * 设置动画是否反弹
   */
  bounce(b: boolean): this {
    this._bounce = b;
    return this;
  }

  /**
   * 推进动画
   */
  advance(delta: number): void {
    const nextTime = this.currentTime + delta;

    // 如果还没开始，直接return
    if (nextTime < this._startTime) {
      return;
    }
    // 如果已经结束，设置状态后return
    if (nextTime >= this._startTime + this._totalDuration) {
      this.onEnd();
      this.status = AnimateStatus.END;
      return;
    }

    this.status = AnimateStatus.RUNNING;

    const deltaFotStep = nextTime - this._startTime;

    // 如果是第一次运行，触发开始回调
    if (this.currentTime <= this._startTime) {
      this.onStart();
    }
    this.currentTime = nextTime;

    let cycleTime = deltaFotStep % this._duration;

    // 如果是反转动画，需要反转周期内的时间
    if (this._reversed) {
      cycleTime = this._duration - cycleTime;
    }

    // 选择起始步骤和遍历方向
    let targetStep: IStep | null = null;

    if (this._lastStep === this._firstStep) {
      targetStep = this._firstStep;
    } else {
      let currentStep: IStep | null = null;
      if (this._reversed) {
        // 反转时从最后一个步骤开始查找
        currentStep = this._lastStep;

        // 从后向前寻找当前时间所在的step
        while (currentStep) {
          const stepEndTime = currentStep.getStartTime() + currentStep.getDuration();

          // 反转时，我们需要从动画结束时间向开始时间查找
          if (cycleTime <= stepEndTime && cycleTime > currentStep.getStartTime()) {
            targetStep = currentStep;
            break;
          }

          currentStep = currentStep.prev;
        }
      } else {
        // 正常顺序从第一个步骤开始查找
        currentStep = this._firstStep;

        // 从前向后寻找当前时间所在的step
        while (currentStep) {
          const stepStartTime = currentStep.getStartTime();
          const stepDuration = currentStep.getDuration();
          const stepEndTime = stepStartTime + stepDuration;

          // 找到当前周期时间所在的step
          if (cycleTime >= stepStartTime && cycleTime < stepEndTime) {
            targetStep = currentStep;
            break;
          }

          currentStep = currentStep.next;
        }
      }
    }

    // 如果没找到目标step（可能是所有step都执行完了，但整体动画还没结束，这正常是不存在的）
    if (!targetStep) {
      this.currentTime = nextTime;
      console.warn('动画出现问题');
      return;
    }

    // 计算当前step的进度比例（基于当前step内的相对时间）
    const stepStartTime = targetStep.getStartTime();
    const stepDuration = targetStep.getDuration();

    const ratio = this._reversed
      ? (stepStartTime + stepDuration - cycleTime) / stepDuration
      : (cycleTime - stepStartTime) / stepDuration;
    // // 限制ratio在0-1之间
    // ratio = Math.max(0, Math.min(1, ratio));

    const isEnd = ratio >= 1;
    targetStep.onUpdate(isEnd, ratio, {});

    // 如果step执行完毕
    if (isEnd) {
      targetStep.onEnd();
      // 不立即调用onFinish，让动画系统来决定何时结束
    }

    // 触发帧回调
    // if (this._onFrame) {
    //   this._onFrame.forEach(cb => cb(targetStep, ratio));
    // }
  }

  protected updateDuration(): void {
    if (!this._lastStep) {
      this._duration = 0;
      return;
    }

    this._duration = this._lastStep.getStartTime() + this._lastStep.getDuration();
    this._totalDuration = this._duration * (this._loopCount + 1);
  }
}
