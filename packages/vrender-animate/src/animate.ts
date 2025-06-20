import { Step, WaitStep } from './step';
import {
  Generator,
  AnimateStatus,
  AnimateStepType,
  type IGraphic,
  type IAnimate,
  type IStep,
  type ICustomAnimate,
  type EasingType,
  type ITimeline
} from '@visactor/vrender-core';
import { defaultTimeline } from './timeline';

export class Animate implements IAnimate {
  readonly id: string | number;
  status: AnimateStatus;
  target: IGraphic;

  // 回调函数列表
  _onStart?: (() => void)[];
  _onFrame?: ((step: IStep, ratio: number) => void)[];
  _onEnd?: (() => void)[];
  _onRemove?: (() => void)[];

  // 时间控制
  private _timeline: ITimeline;
  private _startTime: number;
  private _duration: number;
  private _totalDuration: number;

  // 动画控制
  // private _reversed: boolean;
  private _loopCount: number;
  private _currentLoop: number;
  private _bounce: boolean;

  // 链表头节点和尾节点
  private _firstStep: IStep | null;
  private _lastStep: IStep | null;

  // 初始属性和屏蔽的属性
  private _startProps: Record<string, any>;
  private _endProps: Record<string, any>;
  private _preventAttrs: Set<string>;
  // 优先级，用于判定是否能被后续的动画preventAttr
  declare priority: number;

  protected currentTime: number;
  slience?: boolean;

  // 临时变量
  lastRunStep?: IStep;

  interpolateUpdateFunction:
    | ((from: Record<string, any>, to: Record<string, any>, ratio: number, step: IStep, target: IGraphic) => void)
    | null;

  constructor(
    id: string | number = Generator.GenAutoIncrementId(),
    timeline: ITimeline = defaultTimeline,
    slience?: boolean
  ) {
    this.id = id;
    this.status = AnimateStatus.INITIAL;
    this._timeline = timeline;
    timeline.addAnimate(this);
    this.slience = slience;
    this._startTime = 0;
    this._duration = 0;
    this._totalDuration = 0;
    // this._reversed = false;
    this._loopCount = 0;
    this._currentLoop = 0;
    this._bounce = false;
    this._firstStep = null;
    this._lastStep = null;
    this._startProps = {};
    this._endProps = {};
    this._preventAttrs = new Set();
    this.currentTime = 0;
    this.interpolateUpdateFunction = null;
    this.priority = 0;
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

    if (!this.target.animates) {
      this.target.animates = new Map();
    }
    this.target.animates.set(this.id, this);
    this.onRemove(() => {
      this.stop();
      this.target.animates.delete(this.id);
    });

    if (this.target.onAnimateBind && !this.slience) {
      this.target.onAnimateBind(this as any);
    }
    // 添加一个animationAttribute属性，用于存储动画过程中的属性
    if (!this.target.animationAttribute) {
      this.target.animationAttribute = {};
    }
    return this;
  }

  /**
   * 动画步骤：to
   * 添加一个to步骤，这会在当前状态到指定状态间进行插值
   */
  to(props: Record<string, any>, duration: number = 300, easing: EasingType = 'linear'): this {
    // 创建新的step
    const step = new Step(AnimateStepType.to, props, duration, easing);

    step.bind(this.target, this);

    this.updateStepAfterAppend(step);

    return this;
  }

  /**
   * 等待延迟
   */
  wait(delay: number): this {
    // 创建新的wait step
    const step = new WaitStep(AnimateStepType.wait, {}, delay, 'linear');

    step.bind(this.target, this);

    this.updateStepAfterAppend(step);

    return this;
  }

  protected updateStepAfterAppend(step: IStep): void {
    // 如果是第一个step
    if (!this._firstStep) {
      this._firstStep = step;
      this._lastStep = step;
    } else {
      // 添加到链表末尾
      this._lastStep.append(step);
      this._lastStep = step;
    }

    this.parseStepProps(step);

    this.updateDuration();
  }

  /**
   * 解析step的props
   * 1. 预先获取step的propKeys并保存
   * 2. 将截止目前的最新props设置到step.props中，这样该props上的属性就是最终的属性了，跳帧时直接设置即可
   * 3. 同步到_endProps中，保存这个Animate实例的最终props
   * 4. 给step的props的原型链上绑定Animate的_startProps，这样在下一个step查找fromProps的时候，一定能拿得到值
   */
  parseStepProps(step: IStep) {
    if (!this._lastStep) {
      return;
    }

    /* 预设置step的属性，基于性能考虑，实现比较复杂 */
    // step.propKeys为真实的props属性的key
    step.propKeys = step.propKeys || Object.keys(step.props);
    // step.props为包含前序step的props的最终props，用于跳帧等场景，可以直接设置
    Object.keys(this._endProps).forEach(key => {
      step.props[key] = step.props[key] ?? this._endProps[key];
    });
    // 将最终的props设置到step.props中
    step.propKeys.forEach(key => {
      this._endProps[key] = step.props[key];
    });
    // 给step的props的原型链上绑定Animate的_startProps
    // 下一个step在查找上一个step.props（也就是找到它的fromProps）的时候，就能拿到初始的props了
    // 比如：
    // rect.animate().to({ x: 100 }, 1000, 'linear').to({ y: 100 }, 1000, 'linear');
    // 在第二个step查找fromProps的时候，就能拿到第一个step的endProps中的y值（在原型链上）
    // TODO 由于会有其他animate的干扰，所以不能直接设置原型链
    // Object.setPrototypeOf(step.props, this._startProps);
  }

  /**
   * 重新同步和计算props，用于内部某些step发生了变更后，重新计算自身
   * 性能较差，不要频繁调用
   * @returns
   */
  reSyncProps() {
    if (!this._lastStep) {
      return;
    }
    this._endProps = {};
    let currentStep: IStep = this._firstStep;
    // 从前向后寻找当前时间所在的step
    while (currentStep) {
      // step.props为包含前序step的props的最终props，用于跳帧等场景，可以直接设置
      // eslint-disable-next-line no-loop-func
      Object.keys(this._endProps).forEach(key => {
        currentStep.props[key] = currentStep.props[key] ?? this._endProps[key];
      });
      // 将最终的props设置到step.props中
      // eslint-disable-next-line no-loop-func
      currentStep.propKeys.forEach(key => {
        this._endProps[key] = currentStep.props[key];
      });
      // 给step的props的原型链上绑定Animate的_startProps
      // 下一个step在查找上一个step.props（也就是找到它的fromProps）的时候，就能拿到初始的props了
      // 比如：
      // rect.animate().to({ x: 100 }, 1000, 'linear').to({ y: 100 }, 1000, 'linear');
      // 在第二个step查找fromProps的时候，就能拿到第一个step的endProps中的y值（在原型链上）
      // TODO 由于会有其他animate的干扰，所以不能直接设置原型链
      // Object.setPrototypeOf(currentStep.props, this._startProps);
      currentStep = currentStep.next;
    }
  }

  /**
   * 动画步骤：from
   * 添加一个from步骤，这会将目标属性先设置为指定值，然后过渡到当前状态
   * 【注意】这可能会导致动画跳变，请谨慎使用
   */
  from(props: Record<string, any>, duration: number = 300, easing: EasingType = 'linear'): this {
    // 创建新的step
    const step = new Step(AnimateStepType.from, props, duration, easing);

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
   * 自定义动画
   */
  play(customAnimate: ICustomAnimate): this {
    customAnimate.bind(this.target, this);
    this.updateStepAfterAppend(customAnimate);

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
      this._onStart?.forEach(cb => cb());
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
      this._onEnd?.forEach(cb => cb());
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
   * 注册移除回调
   */
  onRemove(cb?: () => void): void {
    if (cb) {
      if (!this._onRemove) {
        this._onRemove = [];
      }
      this._onRemove.push(cb);
    } else {
      this._onRemove?.forEach(cb => cb());
    }
  }

  /**
   * 屏蔽单个属性
   */
  preventAttr(key: string): void {
    this._preventAttrs.add(key);
    // 从所有step中移除该属性，并从自身的_startProps和_endProps中移除该属性
    delete this._startProps[key];
    delete this._endProps[key];
    let step = this._firstStep;
    while (step) {
      step.deleteSelfAttr(key);
      step = step.next;
    }
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
    // TODO 有些动画可能一添加就被删除
    // if (this.status === AnimateStatus.END) {
    //   return;
    // }
    // 遍历step，调用其stop
    let step = this._firstStep;
    while (step) {
      step.stop();
      step = step.next;
    }

    if (this.status !== AnimateStatus.END) {
      this.onEnd();
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
   * 在所有动画完成后执行
   */
  afterAll(list: IAnimate[]): this {
    if (!list || list.length === 0) {
      return this;
    }

    // 计算所有动画结束的最大时间点
    let maxEndTime = 0;
    list.forEach(animate => {
      const endTime = animate.getStartTime() + animate.getTotalDuration();
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
    const endTime = animate.getStartTime() + animate.getTotalDuration();

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

  // /**
  //  * 设置动画是否反转
  //  */
  // reversed(r: boolean): this {
  //   this._reversed = r;
  //   return this;
  // }

  /**
   * 设置动画循环次数，如果传入true，则无限循环，如果传入false，则不循环
   */
  loop(n: number | boolean): this {
    if (n === true) {
      n = Infinity;
    } else if (n === false) {
      n = 0;
    }
    this._loopCount = n;
    this.updateDuration();
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
    if (this.status === AnimateStatus.END) {
      console.warn('aaa 动画已经结束，不能推进');
      return;
    }
    const nextTime = this.currentTime + delta;
    // 如果还没开始，直接return
    if (nextTime < this._startTime) {
      this.currentTime = nextTime;
      return;
    }
    // 如果已经结束，设置状态后return
    if (nextTime >= this._startTime + this._totalDuration) {
      this._lastStep?.onUpdate(true, 1, {});
      this._lastStep?.onEnd();
      this.onEnd();
      this.status = AnimateStatus.END;
      return;
    }

    this.status = AnimateStatus.RUNNING;

    // 如果是第一次运行，触发开始回调
    if (this.currentTime <= this._startTime) {
      this.onStart();
    }
    this.currentTime = nextTime;

    let cycleTime = nextTime - this._startTime;
    let newLoop = false;
    let bounceTime = false;
    if (this._loopCount > 0) {
      cycleTime = (nextTime - this._startTime) % this._duration;
      const currentLoop = Math.floor((nextTime - this._startTime) / this._duration);
      newLoop = currentLoop > this._currentLoop;
      this._currentLoop = currentLoop;

      bounceTime = this._bounce && currentLoop % 2 === 1;
      if (bounceTime) {
        cycleTime = this._duration - cycleTime;
      }
    }

    // 如果是新的循环，重置为初始状态
    if (newLoop && !bounceTime) {
      this.target.setAttributes(this._startProps);
    }

    // 选择起始步骤和遍历方向
    let targetStep: IStep | null = null;

    if (this._lastStep === this._firstStep) {
      targetStep = this._firstStep;
    } else {
      let currentStep: IStep = this._firstStep;
      // 从前向后寻找当前时间所在的step
      while (currentStep) {
        const stepStartTime = currentStep.getStartTime();
        const stepDuration = currentStep.getDuration();
        const stepEndTime = stepStartTime + stepDuration;

        // 找到当前周期时间所在的step
        if (cycleTime >= stepStartTime && cycleTime <= stepEndTime) {
          targetStep = currentStep;
          break;
        }

        currentStep = currentStep.next;
      }
    }

    // 如果没找到目标step（可能是所有step都执行完了，但整体动画还没结束，这正常是不存在的）
    if (!targetStep) {
      // this.currentTime = nextTime;
      // console.warn('动画出现问题');
      return;
    }

    // 如果当前step和上一次执行的step不一样，则调用上一次step的onEnd，确保所有完成的step都调用了结束
    // 如果上一次的step已经调用了onEnd，在下面的onEnd那里会将lastRunStep设置为null
    if (targetStep !== this.lastRunStep) {
      this.lastRunStep?.onEnd();
    }

    this.lastRunStep = targetStep;

    // 计算当前step的进度比例（基于当前step内的相对时间）
    const stepStartTime = targetStep.getStartTime();
    const stepDuration = targetStep.getDuration();

    const ratio = (cycleTime - stepStartTime) / stepDuration;
    // // 限制ratio在0-1之间
    // ratio = Math.max(0, Math.min(1, ratio));

    const isEnd = ratio >= 1;
    targetStep.update(isEnd, ratio, {});

    // 如果step执行完毕
    if (isEnd) {
      targetStep.onEnd();
      this.lastRunStep = null;
      // 不立即调用onFinish，让动画系统来决定何时结束
    }

    // 触发帧回调
    // if (this._onFrame) {
    //   this._onFrame.forEach(cb => cb(targetStep, ratio));
    // }
  }

  updateDuration(): void {
    if (!this._lastStep) {
      this._duration = 0;
      return;
    }

    this._duration = this._lastStep.getStartTime() + this._lastStep.getDuration();
    this._totalDuration = this._duration * (this._loopCount + 1);
  }

  getTotalDuration(): number {
    return this._totalDuration;
  }

  getLoop(): number {
    return this._loopCount;
  }
}
