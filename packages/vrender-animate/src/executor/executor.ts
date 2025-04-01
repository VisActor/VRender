import type { IGraphic } from '@visactor/vrender-core';
import type { EasingType } from '../intreface/easing';
import type { ACustomAnimate } from '../custom/custom-animate';

export type MarkFunctionCallback<T> = (datum: any, graphic: IGraphic, parameters: any) => T;
export type MarkFunctionValueType<T> = MarkFunctionCallback<T> | T;

interface IAnimationParameters {
  [key: string]: any;
}

/**
 * 动画 channel 配置
 */
export type IAnimationChannelFunction = (datum: any, element: IGraphic, parameters: IAnimationParameters) => any;

/**
 * 动画 channel 属性配置
 */
export type IAnimationChannelAttrs = Record<
  string,
  {
    from?: any | IAnimationChannelFunction;
    to?: any | IAnimationChannelFunction;
  }
>;
export type IAnimationChannelAttributes = string[];

/**
 * 动画 channel 插值器
 */
export type IAnimationChannelInterpolator = (
  ratio: number,
  from: any,
  to: any,
  nextAttributes: any,
  datum: any,
  element: IGraphic,
  parameters: IAnimationParameters
) => boolean | void;

/**
 * 动画 custom 构造器
 */
export interface IAnimationCustomConstructor {
  new (from: any, to: any, duration: number, ease: EasingType, parameters?: any): ACustomAnimate<any>;
}

export interface IAnimationEffect {
  /** 动画类型 */
  type?: string;
  /** 动画 channel 配置 */
  channel?: IAnimationChannelAttrs | IAnimationChannelAttributes;
  /** 动画 to 配置（和channel互斥，如果同时设置，以to为准） */
  to?: Record<string, any>;
  /** 动画 自定义插值 配置 */
  custom?: IAnimationChannelInterpolator | IAnimationCustomConstructor;
  /** 动画 custom 参数配置 */
  customParameters?: MarkFunctionValueType<any>;
  /** 动画 easing 配置 */
  easing?: EasingType;
  /** options暂时没有处理 */
  options?: MarkFunctionValueType<any>;
}

export interface IAnimationTimeSlice {
  /** 动画效果 */
  effects: IAnimationEffect | IAnimationEffect[];
  /** 动画时长 */
  duration?: MarkFunctionValueType<number>;
  /** 延迟delay后执行动画 */
  delay?: MarkFunctionValueType<number>;
  /** effect动画后再延迟delayAfter结束这个周期 */
  delayAfter?: MarkFunctionValueType<number>;
}

export interface IAnimationControlOptions {
  /** 当动画状态变更时清空动画 */
  stopWhenStateChange?: boolean;
  /** 是否立即应用动画初始状态 */
  immediatelyApply?: boolean;
  /** encode 计算图元最终状态时是否忽略循环动画 */
  ignoreLoopFinalAttributes?: boolean;
}

/**
 * 动画 config 简化配置
 */
export interface IAnimationTypeConfig {
  /** 动画类型 */
  type?: string;
  /** 动画 channel 配置 */
  channel?: IAnimationChannelAttrs | IAnimationChannelAttributes;
  /** 动画 to 配置（和channel互斥，如果同时设置，以to为准） */
  to?: Record<string, any>;
  /** 动画 自定义插值 配置 */
  custom?: IAnimationChannelInterpolator | IAnimationCustomConstructor;
  /** 动画 custom 参数配置 */
  customParameters?: MarkFunctionValueType<any>;
  /** 动画 easing 配置 */
  easing?: EasingType;
  /** 动画 delay 配置 */
  delay?: MarkFunctionValueType<number>;
  /** 动画 delayAfter 配置 */
  delayAfter?: MarkFunctionValueType<number>;
  /** 动画 duration 配置 */
  duration?: MarkFunctionValueType<number>;
  /** 动画 oneByOne 配置（是否依次执行） */
  oneByOne?: MarkFunctionValueType<boolean | number>;
  /** 动画 startTime 配置 */
  startTime?: MarkFunctionValueType<number>;
  /** 动画 totalTime 配置（如果有循环，只算一个周期） */
  totalTime?: MarkFunctionValueType<number>;
  /** loop: true 无限循环; loop: 正整数，表示循环的次数 */
  loop?: boolean | number;
  /** 动画 effect 配置项 */
  options?: MarkFunctionValueType<any>;
  /** 动画执行相关控制配置项 */
  controlOptions?: IAnimationControlOptions;
  /** 动画优先级 */
  priority?: number;
  /** 该动画是否需要忽略子图元 */
  selfOnly?: boolean;
}

/**
 * 动画 timeline 完整配置，一条时间线内的动画单元只能串行
 * 多个timeline是可以并行的
 * 考虑到同一图元不能在多个timeline上，所以timeline不应该提供数组配置的能力
 */
export interface IAnimationTimeline {
  /** 为了方便动画编排，用户可以设置 id 用于识别时间线 */
  id?: string;
  /** 时间切片 */
  timeSlices: IAnimationTimeSlice | IAnimationTimeSlice[];
  /** 动画开始的相对时间，可以为负数 */
  startTime?: MarkFunctionValueType<number>;
  /** 动画时长 */
  totalTime?: MarkFunctionValueType<number>;
  /** 动画依次执行的延迟 */
  oneByOne?: MarkFunctionValueType<number | boolean>;
  /** loop: true 无限循环; loop: 正整数，表示循环的次数 */
  loop?: MarkFunctionValueType<number | boolean>;
  /** 对图元元素进行划分，和过滤类似，但是不同时间线不能同时作用在相同的元素上 */
  partitioner?: MarkFunctionCallback<boolean>;
  /** 对同一时间线上的元素进行排序 */
  sort?: (datumA: any, datumB: any, elementA: IGraphic, elementB: IGraphic, parameters: any) => number;
  /** 动画执行相关控制配置项 */
  controlOptions?: IAnimationControlOptions;
  /** 动画优先级 */
  priority?: number;
  /** 该动画是否需要忽略子图元 */
  selfOnly?: boolean;
}

/**
 * 动画配置
 */
export type IAnimationConfig = IAnimationTimeline | IAnimationTypeConfig;
