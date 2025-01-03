import type { EventEmitter } from '@visactor/vutils';
import type { AnimateMode, AnimateStatus, AnimateStepType } from '../common/enums';
import type { Releaseable } from './common';
import type { IGraphic } from './graphic';

// export type EasingType = (...args: any) => any;

export declare class Easing {
  static linear(t: number): number;
  static none(): typeof Easing.linear;
  /**
   * 获取缓动函数，amount指示这个缓动函数的插值方式
   * @param amount
   * @returns
   */
  static get(amount: number): (t: number) => number;
  static getPowIn(pow: number): (t: number) => number;
  static getPowOut(pow: number): (t: number) => number;
  static getPowInOut(pow: number): (t: number) => number;
  static quadIn: (t: number) => number;
  static quadOut: (t: number) => number;
  static quadInOut: (t: number) => number;
  static cubicIn: (t: number) => number;
  static cubicOut: (t: number) => number;
  static cubicInOut: (t: number) => number;
  static quartIn: (t: number) => number;
  static quartOut: (t: number) => number;
  static quartInOut: (t: number) => number;
  static quintIn: (t: number) => number;
  static quintOut: (t: number) => number;
  static quintInOut: (t: number) => number;
  static getBackIn(amount: number): (t: number) => number;
  static getBackOut(amount: number): (t: number) => number;
  static getBackInOut(amount: number): (t: number) => number;
  static backIn: (t: number) => number;
  static backOut: (t: number) => number;
  static backInOut: (t: number) => number;
  static circIn(t: number): number;
  static circOut(t: number): number;
  static circInOut(t: number): number;
  static bounceOut(t: number): number;
  static bounceIn(t: number): number;
  static bounceInOut(t: number): number;
  static getElasticIn(amplitude: number, period: number): (t: number) => number;
  static getElasticOut(amplitude: number, period: number): (t: number) => number;
  static getElasticInOut(amplitude: number, period: number): (t: number) => number;
  static elasticIn: (t: number) => number;
  static elasticOut: (t: number) => number;
  static elasticInOut: (t: number) => number;
}

// timeline管理一堆的animate，多个timeline互不影响
// timeline主要作用是基于layer层面的整体管理
// 每个layer默认带有一个timeline
export interface Timeline {
  AnimateList: IAnimate[];
}

type IStopType = 'end' | 'start' | 'current';

// TODO: 提供options配置可序列化
interface AnimateSpecItem {
  type: 'to' | 'delay' | 'stop' | 'any';
  params: any[];
}

export type EasingTypeStr =
  | 'linear'
  | 'quadIn'
  | 'quadOut'
  | 'quadInOut'
  | 'quadInOut'
  | 'cubicIn'
  | 'cubicOut'
  | 'cubicInOut'
  | 'quartIn'
  | 'quartOut'
  | 'quartInOut'
  | 'quintIn'
  | 'quintOut'
  | 'quintInOut'
  | 'backIn'
  | 'backOut'
  | 'backInOut'
  | 'circIn'
  | 'circOut'
  | 'circInOut'
  | 'bounceOut'
  | 'bounceIn'
  | 'bounceInOut'
  | 'elasticIn'
  | 'elasticOut'
  | 'elasticInOut'
  | 'sineIn'
  | 'sineOut'
  | 'sineInOut'
  | 'expoIn'
  | 'expoOut'
  | 'expoInOut'
  | '';
export type EasingTypeFunc = (t: number) => number;

export type EasingType = EasingTypeStr | EasingTypeFunc;

export type IAnimateStepType = keyof typeof AnimateStepType;

export interface IStep {
  type: IAnimateStepType;
  prev?: IStep;
  // 持续时间
  duration: number;
  // 在animate中的位置
  position: number;
  next?: IStep;
  props?: any;
  parsedProps?: any;
  propKeys?: string[];
  easing?: EasingTypeFunc;
  customAnimate?: ICustomAnimate;

  append: (step: IStep) => void;
  getLastProps: () => any;
}

export interface IStepConfig {
  tempProps?: boolean; // props为临时props，可以直接使用不用拷贝
  noPreventAttrs?: boolean;
}

export interface IAnimateTarget {
  onAnimateBind?: (animte: IAnimate | ISubAnimate) => void;
  // 添加动画step的时候调用
  onAddStep?: (step: IStep) => void;
  // step时调用
  onStep: (subAnimate: ISubAnimate, animate: IAnimate, step: IStep, ratio: number, end: boolean) => void;
  // 插值函数
  stepInterpolate: (
    subAnimate: ISubAnimate,
    animate: IAnimate,
    nextAttributes: Record<string, any>,
    step: IStep,
    ratio: number,
    end: boolean,
    nextProps: Record<string, any>,
    lastProps?: Record<string, any>,
    nextParsedProps?: any,
    propKeys?: string[]
  ) => void;
  // 获取属性
  getComputedAttribute: (name: string) => any;
  // 获取默认属性
  getDefaultAttribute: (name: string) => any;
  onStop: (props?: Record<string, any>) => void;
  animates: Map<string | number, IAnimate>;
  [key: string]: any;
}

export interface ICustomAnimate {
  duration: number;
  easing: EasingType;
  step?: IStep;
  mode?: AnimateMode;

  bind: (target: IAnimateTarget, subAni: ISubAnimate) => void;
  // 在第一次调用的时候触发
  onBind: () => void;
  // 第一次执行的时候调用
  onFirstRun: () => void;
  // 开始执行的时候调用（如果有循环，那每个周期都会调用）
  onStart: () => void;
  // 结束执行的时候调用（如果有循环，那每个周期都会调用）
  onEnd: () => void;
  onUpdate: (end: boolean, ratio: number, out: Record<string, any>) => void;
  update: (end: boolean, ratio: number, out: Record<string, any>) => void;
  getEndProps: () => Record<string, any> | void;
  getFromProps: () => Record<string, any> | void;
  getMergedEndProps: () => Record<string, any> | void;
}

// 每一个animate绑定一个graphic，用于描述这个graphic的动画内容
// 在timeline层面，animate相当于是一段timeslice
export interface IAnimate {
  readonly id: string | number;
  status: AnimateStatus;

  interpolateFunc: (key: string, ratio: number, from: any, to: any, nextAttributes: any) => boolean;

  _onStart?: (() => void)[];
  _onFrame?: ((step: IStep, ratio: number) => void)[];
  _onEnd?: (() => void)[];
  _onRemove?: (() => void)[];

  getStartProps: () => Record<string, any>;
  getEndProps: () => Record<string, any>;

  setTimeline: (timeline: ITimeline) => void;

  bind: (target: IAnimateTarget) => this;
  to: (props: Record<string, any>, duration: number, easing: EasingType, params?: IStepConfig) => this;
  from: (props: Record<string, any>, duration: number, easing: EasingType, params?: IStepConfig) => this;
  pause: () => void;
  resume: () => void;
  onStart: (cb: () => void) => void;
  onEnd: (cb: () => void) => void;
  onFrame: (cb: (step: IStep, ratio: number) => void) => void;
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
    target: IAnimateTarget,
    ret: Record<string, any>
  ) => boolean;
  //
  play: (customAnimate: ICustomAnimate) => this;

  // 获取该属性的上一个值
  // getLastPropByName: (name: string, step: IStep) => any;
  // delay: (duration: number) => IAnimate;
  stop: (type?: 'start' | 'end' | Record<string, any>) => void;
  /** 打上END标志，下一帧被删除 */
  release: () => void;
  // 获取持续的时长
  getDuration: () => number;
  // 获取动画开始时间（注意并不是子动画的startAt）
  getStartTime: () => number;
  // done: (cb: (_: any) => any) => IAnimate;
  // pause: () => IAnimate;
  // spec: (spec: AnimateSpecItem[]) => IAnimate;
  // start: () => void; // 有start方法，避免动画提前开始（VGrammar需要时间处理数据）
  wait: (delay: number) => this;

  // // 编排
  afterAll: (list: IAnimate[]) => this;
  after: (animate: IAnimate) => this;
  parallel: (animate: IAnimate) => this;

  // // timislice (getter)
  // startTime: number;
  // endTime: number;
  // startTimes: number[];
  // endTimes: number[];

  // // 高级参数，frame到frameEnd之间可以进行reverse，loop，bounce效果
  // frame: () => IAnimate;
  // frameEnd: () => IAnimate;
  reversed: (r: boolean) => IAnimate;
  loop: (n: number) => IAnimate;
  bounce: (b: boolean) => IAnimate;

  nextAnimate?: IAnimate;
  prevAnimate?: IAnimate;

  advance: (delta: number) => void;

  startAt: (t: number) => IAnimate;

  // // 语法糖
  // create: (duration: number) => IAnimate;
  // fadeIn: (duration: number) => IAnimate;
}

export interface ISubAnimate {
  getLastStep: () => IStep;
  animate: IAnimate;
  // 获取该属性的上一个值
  getLastPropByName: (name: string, step: IStep) => any;
}

// rect.animate().abc().to({}, 1000).delay(1000).frame().to().delay().to().frameEnd().loop().bounce()

export interface BaseAnimateConfig {
  id?: number | string;
  interpolate?: (key: string, ratio: number, from: any, to: any, nextAttributes: any) => boolean;
  onStart?: () => void;
  onFrame?: (step: IStep, ratio: number) => void;
  onEnd?: () => void;
  onRemove?: () => void;
}

// VGrammar和 vrender命名不一致，好尴尬
export interface MorphingAnimateConfig extends Omit<BaseAnimateConfig, 'interpolate'> {
  duration?: number;
  easing?: EasingType; // 统一到easing
  delay?: number;
}

export interface MultiMorphingAnimateConfig extends MorphingAnimateConfig {
  splitPath?: 'clone' | ((graphic: IGraphic, count: number, needAppend?: boolean) => IGraphic[]);
  individualDelay?: (index: number, count: number, fromGraphic: IGraphic, toGraphic: IGraphic) => number;
}

export interface ITimeline {
  id: number;
  animateCount: number;
  addAnimate: (animate: IAnimate) => void;
  removeAnimate: (animate: IAnimate, release?: boolean) => void;
  tick: (delta: number) => void;
  clear: () => void;
  pause: () => void;
  resume: () => void;
}

export interface ITickHandler extends Releaseable {
  avaliable: () => boolean;
  /**
   * 开始执行tick
   * @param interval 延时 ms
   * @param cb 执行的回调
   */
  tick: (interval: number, cb: (handler: ITickHandler) => void) => void; // 开始
  tickTo?: (t: number, cb: (handler: ITickHandler, params?: { once: boolean }) => void) => void;
  getTime: () => number; // 获取时间
}

export interface ITickerHandlerStatic {
  Avaliable: () => boolean;
  new (): ITickHandler;
}

export interface ITicker extends EventEmitter {
  setFPS?: (fps: number) => void;
  setInterval?: (interval: number) => void;
  getFPS?: () => number;
  getInterval?: () => number;
  tick: (interval: number) => void;
  tickAt?: (time: number) => void;
  pause: () => boolean;
  resume: () => boolean;
  /**
   * 开启tick，force为true强制开启，否则如果timeline为空则不开启
   */
  start: (force?: boolean) => boolean;
  stop: () => void;
  addTimeline: (timeline: ITimeline) => void;
  remTimeline: (timeline: ITimeline) => void;
  trySyncTickStatus: () => void;
}
