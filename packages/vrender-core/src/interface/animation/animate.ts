import type { IGraphic } from '../graphic';
import type { EasingType, EasingTypeFunc } from './easing';
import type { AnimateStatus, IAnimateStepType } from './type';
import type { ITimeline } from './timeline';

export interface ICustomAnimate extends IStep {
  type: IAnimateStepType;
}

export interface IStep {
  type: IAnimateStepType;
  prev?: IStep;
  // 持续时间
  duration: number;
  // 链表，下一个
  next?: IStep;
  // 属性
  props?: Record<string, any>;
  // 解析后的属性（用于性能优化，避免每次tick都解析）
  fromParsedProps?: Record<string, any>;
  toParsedProps?: Record<string, any>;
  fromProps?: Record<string, any>;
  // 解析后的属性列表（用于性能优化，避免每次tick都解析）
  propKeys?: string[];
  // 缓动函数
  easing?: EasingTypeFunc;

  // 添加一个
  append: (step: IStep) => void;
  // 获取上一个props，用于完成这次的fromValue 和 toValue的插值
  getLastProps: () => any;

  animate: IAnimate;

  // 设置持续时间
  setDuration: (duration: number, updateDownstream?: boolean) => void;
  // 获取持续时间
  getDuration: () => number;
  // 确定插值更新函数（在开始的时候就确定，避免每次tick都解析）
  determineInterpolateUpdateFunction: () => void;

  // 设置开始时间
  setStartTime: (time: number, updateDownstream?: boolean) => void;
  // 获取开始时间
  getStartTime: () => number;

  bind: (target: IGraphic, animate: IAnimate) => void;
  // 在第一次绑定到Animate的时候触发
  onBind: () => void;
  // 第一次执行的时候调用
  onFirstRun: () => void;
  // 开始执行的时候调用（如果有循环，那每个周期都会调用）
  onStart: () => void;
  // 结束执行的时候调用（如果有循环，那每个周期都会调用）
  onEnd: (cb?: (animate: IAnimate, step: IStep) => void) => void;
  // 更新执行的时候调用（如果有循环，那每个周期都会调用）
  update: (end: boolean, ratio: number, out: Record<string, any>) => void;
  onUpdate: (end: boolean, ratio: number, out: Record<string, any>) => void;

  getEndProps: () => Record<string, any> | void;
  getFromProps: () => Record<string, any> | void;
  getMergedEndProps: () => Record<string, any> | void;

  // 屏蔽自身属性，会直接从props等内容里删除掉
  deleteSelfAttr: (key: string) => void;

  // 停止
  stop: () => void;
}

export interface IAnimate {
  readonly id: string | number;
  status: AnimateStatus;
  target: IGraphic;
  priority: number;
  interpolateUpdateFunction:
    | ((from: Record<string, any>, to: Record<string, any>, ratio: number, step: IStep, target: IGraphic) => void)
    | null;

  _onStart?: (() => void)[];
  _onFrame?: ((step: IStep, ratio: number) => void)[];
  _onEnd?: (() => void)[];
  _onRemove?: (() => void)[];

  getStartProps: () => Record<string, any>;
  getEndProps: () => Record<string, any>;

  // 设置timeline
  setTimeline: (timeline: ITimeline) => void;
  // 获取timeline
  getTimeline: () => ITimeline;
  readonly timeline: ITimeline;

  bind: (target: IGraphic) => this;
  to: (props: Record<string, any>, duration: number, easing: EasingType) => this;
  from: (props: Record<string, any>, duration: number, easing: EasingType) => this;
  pause: () => void;
  resume: () => void;
  onStart: (cb?: () => void) => void;
  onEnd: (cb?: () => void) => void;
  onFrame: (cb: (step: IStep, ratio: number) => void) => void;
  onRemove: (cb?: () => void) => void;
  // 屏蔽属性
  preventAttr: (key: string) => void;
  // 屏蔽属性
  preventAttrs: (key: string[]) => void;
  // 属性是否合法
  validAttr: (key: string) => boolean;

  runCb: (cb: (a: IAnimate, step: IStep) => void) => IAnimate;

  // 自定义插值，返回false表示没有匹配上
  customInterpolate: (
    key: string,
    ratio: number,
    from: any,
    to: any,
    target: IGraphic,
    ret: Record<string, any>
  ) => boolean;
  play: (customAnimate: ICustomAnimate) => this;

  getFromValue: () => Record<string, any>;
  getToValue: () => Record<string, any>;
  // 停止，可以设置停止后设置target的属性为开始的值（fromValue），还是结束的值（toValue）
  stop: (type?: 'start' | 'end' | Record<string, any>) => void;
  /** 打上END标志，下一帧被删除 */
  release: () => void;
  // 获取持续的时长
  getDuration: () => number;
  getTotalDuration: () => number;
  // 获取动画开始时间（注意并不是子动画的startAt）
  getStartTime: () => number;
  // 等待delay
  wait: (delay: number) => this;

  /* 动画编排 */
  // 所有动画结束后执行
  afterAll: (list: IAnimate[]) => this;
  // 在某个动画结束后执行
  after: (animate: IAnimate) => this;
  // 并行执行
  parallel: (animate: IAnimate) => this;

  getLoop: () => number;

  // 反转动画
  // reversed: (r: boolean) => IAnimate;
  // 循环动画
  loop: (n: number | boolean) => IAnimate;
  // 反弹动画
  bounce: (b: boolean) => IAnimate;

  advance: (delta: number) => void;

  // 设置开始时间（startAt之前是完全不会进入动画生命周期的）
  // 它和wait不一样，如果调用的是wait，wait过程中还算是一个动画阶段，只是空的阶段，而startAt之前是完全不会进入动画生命周期的
  startAt: (t: number) => IAnimate;

  // 重新同步和计算props，用于内部某些step发生了变更后，重新计算自身
  reSyncProps: () => void;

  // 更新duration
  updateDuration: () => void;
}

export enum AnimateMode {
  NORMAL = 0b0000,
  SET_ATTR_IMMEDIATELY = 0b0001
}

export interface IAnimateTarget {
  onAnimateBind?: (animte: IAnimate) => void;
  // 获取属性
  getComputedAttribute: (name: string) => any;
  // 获取默认属性
  getDefaultAttribute: (name: string) => any;
  onStop: (props?: Record<string, any>) => void;
  animates: Map<string | number, IAnimate>;
  [key: string]: any;
}

export interface BaseAnimateConfig {
  id?: number | string;
  interpolate?: (key: string, ratio: number, from: any, to: any, nextAttributes: any) => boolean;
  onStart?: () => void;
  onFrame?: (step: IStep, ratio: number) => void;
  onEnd?: () => void;
  onRemove?: () => void;
}

export interface MorphingAnimateConfig extends Omit<BaseAnimateConfig, 'interpolate'> {
  duration?: number;
  easing?: EasingType; // 统一到easing
  delay?: number;
}

export interface MultiMorphingAnimateConfig extends MorphingAnimateConfig {
  splitPath?: 'clone' | ((graphic: IGraphic, count: number, needAppend?: boolean) => IGraphic[]);
  individualDelay?: (index: number, count: number, fromGraphic: IGraphic, toGraphic: IGraphic) => number;
}
