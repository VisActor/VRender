import type { IGraphic, IGroup } from '@visactor/vrender-core';
import type {
  IAnimationConfig,
  IAnimationTimeline,
  IAnimationTypeConfig,
  MarkFunctionCallback,
  MarkFunctionValueType,
  IAnimationTimeSlice,
  IAnimationChannelAttrs,
  IAnimationChannelAttributes,
  IAnimationCustomConstructor,
  IAnimationChannelInterpolator
} from './executor';
import type { EasingType } from '../intreface/easing';
import type { IAnimate } from '../intreface/animate';
import { cloneDeep, isArray, isFunction, scale } from '@visactor/vutils';

interface IAnimateExecutor {
  execute: (params: IAnimationConfig) => void;
  executeItem: (params: IAnimationConfig, graphic: IGraphic, index?: number) => IAnimate | null;
  onStart: (cb?: () => void) => void;
  onEnd: (cb?: () => void) => void;
}

export class AnimateExecutor implements IAnimateExecutor {
  declare _target: IGraphic;

  // 所有动画实例
  private _animates: IAnimate[] = [];

  // 动画开始回调
  private _startCallbacks: (() => void)[] = [];
  // 动画结束回调
  private _endCallbacks: (() => void)[] = [];

  // 是否已经开始动画
  private _started: boolean = false;

  // 当前正在运行的动画数量
  private _activeCount: number = 0;

  constructor(target: IGraphic) {
    this._target = target;
  }

  /**
   * 注册一个回调，当动画开始时调用
   */
  onStart(cb?: () => void): void {
    if (cb) {
      this._startCallbacks.push(cb);

      // 如果动画已经开始，立即调用回调
      if (this._started && this._activeCount > 0) {
        cb();
      }
    } else {
      this._startCallbacks.forEach(cb => {
        cb();
      });
    }
  }

  /**
   * 注册一个回调，当所有动画结束时调用
   */
  onEnd(cb?: () => void): void {
    if (cb) {
      this._endCallbacks.push(cb);
    } else {
      this._endCallbacks.forEach(cb => {
        cb();
      });
    }
  }

  /**
   * 跟踪动画并附加生命周期钩子
   */
  private _trackAnimation(animate: IAnimate): void {
    this._animates.push(animate);
    this._activeCount++;

    // 如果这是第一个正在运行的动画，触发onStart回调
    if (this._activeCount === 1 && !this._started) {
      this._started = true;
      this.onStart();
    }

    // 处理动画完成
    animate.onEnd(() => {
      this._activeCount--;

      // 从跟踪的动画中移除
      const index = this._animates.indexOf(animate);
      if (index >= 0) {
        this._animates.splice(index, 1);
      }

      // 如果所有动画都已完成，触发onEnd回调
      if (this._activeCount === 0 && this._started) {
        this._started = false;
        this.onEnd();
      }
    });
  }

  /**
   * 执行动画，针对一组元素
   */
  execute(params: IAnimationConfig) {
    // 判断是否为timeline配置
    const isTimeline = 'timeSlices' in params;

    // 筛选符合条件的子图元
    let filteredChildren: IGraphic[];

    // 如果设置了partitioner，则进行筛选
    if (isTimeline && params.partitioner) {
      filteredChildren = (filteredChildren ?? (this._target.getChildren() as IGraphic[])).filter(child => {
        return (params as IAnimationTimeline).partitioner((child.context as any)?.data, child, {});
      });
    }

    // 如果需要排序，则进行排序
    if (isTimeline && (params as IAnimationTimeline).sort) {
      filteredChildren = filteredChildren ?? (this._target.getChildren() as IGraphic[]);
      filteredChildren.sort((a, b) => {
        return (params as IAnimationTimeline).sort((a.context as any)?.data, (b.context as any)?.data, a, b, {});
      });
    }

    const totalTime = this.resolveValue(params.totalTime, undefined, undefined);
    const startTime = this.resolveValue(params.startTime, undefined, 0);

    // execute只在mark层面调用，所以性能影响可以忽略
    // TODO 如果后续调用频繁，需要重新修改
    const parsedParams = cloneDeep(params);
    parsedParams.oneByOneDelay = 0;
    parsedParams.startTime = startTime;
    parsedParams.totalTime = totalTime;

    const oneByOne = this.resolveValue(params.oneByOne, undefined, false);

    if (isTimeline) {
      const timeSlices = (parsedParams as IAnimationTimeline).timeSlices;
      if (!isArray(timeSlices)) {
        (parsedParams as IAnimationTimeline).timeSlices = [timeSlices];
      }
      let sliceTime = 0;
      ((parsedParams as IAnimationTimeline).timeSlices as IAnimationTimeSlice[]).forEach(slice => {
        slice.delay = this.resolveValue(slice.delay, undefined, 0);
        slice.delayAfter = this.resolveValue(slice.delayAfter, undefined, 0);
        slice.duration = this.resolveValue(slice.duration, undefined, 300);
        sliceTime += slice.delay + slice.duration + slice.delayAfter;
      });
      let oneByOneDelay = 0;
      let oneByOneTime = 0;
      if (oneByOne) {
        oneByOneTime = Number(oneByOne);
        oneByOneDelay = oneByOneTime;
      }
      parsedParams.oneByOne = oneByOneTime;
      parsedParams.oneByOneDelay = oneByOneDelay;

      if (totalTime) {
        const _totalTime = sliceTime + oneByOneDelay * (this._target.count - 2);
        const scale = totalTime ? totalTime / _totalTime : 1;
        ((parsedParams as IAnimationTimeline).timeSlices as IAnimationTimeSlice[]).forEach(slice => {
          slice.delay = (slice.delay as number) * scale;
          slice.delayAfter = (slice.delayAfter as number) * scale;
          slice.duration = (slice.duration as number) * scale;
        });
        parsedParams.oneByOne = oneByOneTime * scale;
        parsedParams.oneByOneDelay = oneByOneDelay * scale;
        (parsedParams as IAnimationTimeline).startTime = startTime * scale;
      }
    } else {
      const delay = this.resolveValue(params.delay, undefined, 0);
      const delayAfter = this.resolveValue(params.delayAfter, undefined, 0);
      const duration = this.resolveValue(params.duration, undefined, 300);

      let oneByOneDelay = 0;
      let oneByOneTime = 0;
      if (oneByOne) {
        oneByOneTime = Number(oneByOne);
        oneByOneDelay = duration + oneByOneTime;
      }
      parsedParams.oneByOne = oneByOneTime;
      parsedParams.oneByOneDelay = oneByOneDelay;

      if (totalTime) {
        const _totalTime = delay + delayAfter + duration + oneByOneDelay * (this._target.count - 2);
        const scale = totalTime ? totalTime / _totalTime : 1;
        parsedParams.delay = delay * scale;
        parsedParams.delayAfter = delayAfter * scale;
        parsedParams.duration = duration * scale;
        parsedParams.oneByOne = oneByOneTime * scale;
        parsedParams.oneByOneDelay = oneByOneDelay * scale;
        (parsedParams as IAnimationTypeConfig).startTime = startTime;
      }
    }

    // const duration = this.resolveValue(isTimeline ? 0 : (params as IAnimationTypeConfig).duration, undefined, 300);

    // const animates: IAnimate[] = [];

    const cb = isTimeline
      ? (child: IGraphic, index: number) => {
          // 执行单个图元的timeline动画
          const animate = this.executeTimelineItem(parsedParams as IAnimationTimeline, child, index);
          if (animate) {
            this._trackAnimation(animate);
          }
        }
      : (child: IGraphic, index: number) => {
          // 执行单个图元的config动画
          const animate = this.executeTypeConfigItem(parsedParams as IAnimationTypeConfig, child, index);
          if (animate) {
            this._trackAnimation(animate);
          }
        };

    // 执行每个图元的动画
    if (filteredChildren) {
      filteredChildren.forEach(cb);
    } else if (this._target.count <= 1) {
      cb(this._target, 0);
    } else {
      this._target.forEachChildren(cb);
    }

    return;
  }

  /**
   * 执行 TypeConfig 类型的动画
   */
  private executeTypeConfigItem(params: IAnimationTypeConfig, graphic: IGraphic, index: number): IAnimate {
    const {
      type = 'to',
      channel,
      custom,
      customParameters,
      easing = 'linear',
      delay = 0,
      delayAfter = 0,
      duration = 300,
      startTime = 0,
      oneByOneDelay = 0,
      loop,
      bounce,
      priority = 0,
      options,
      controlOptions
    } = params as any;

    // 创建动画实例
    const animate = graphic.animate() as unknown as IAnimate;
    animate.priority = priority;

    const delayValue = delay as number;

    // 设置开始时间
    animate.startAt((startTime as number) + index * oneByOneDelay);

    // 添加延迟
    if (delayValue > 0) {
      animate.wait(delayValue);
    }

    // 根据 channel 配置创建属性对象
    const props = this.createPropsFromChannel(channel, graphic);

    // 处理自定义动画
    if (custom) {
      const customParams = this.resolveValue(customParameters, graphic, {});

      if (isFunction(custom)) {
        if (/^class\s/.test(Function.prototype.toString.call(custom))) {
          // 自定义动画构造器 - 创建自定义动画类
          this.createCustomAnimation(
            animate,
            custom as IAnimationCustomConstructor,
            props,
            duration as number,
            easing,
            customParams
          );
        } else {
          // 自定义插值器 - 创建自定义插值动画
          this.createCustomInterpolatorAnimation(
            animate,
            custom as IAnimationChannelInterpolator,
            props,
            duration as number,
            easing,
            customParams
          );
        }
      }
    } else if (type === 'to') {
      animate.to(props, duration as number, easing);
    } else if (type === 'from') {
      animate.from(props, duration as number, easing);
    }

    // 添加后延迟
    if ((delayAfter as number) > 0) {
      animate.wait(delayAfter as number);
    }

    // 设置循环
    if (loop && (loop as number) > 0) {
      animate.loop(loop as number);
    }

    // 设置反弹
    if (bounce) {
      animate.bounce(true);
    }

    return animate;
  }

  /**
   * 执行 Timeline 类型的动画
   */
  private executeTimelineItem(params: IAnimationTimeline, graphic: IGraphic, index: number): IAnimate {
    const { timeSlices, startTime = 0, loop, bounce, oneByOneDelay, priority, controlOptions } = params as any;

    // 创建动画实例
    const animate = graphic.animate() as unknown as IAnimate;
    animate.priority = priority;

    // 设置开始时间
    animate.startAt((startTime as number) + index * oneByOneDelay);

    // 设置循环
    if (loop && (loop as number) > 0) {
      animate.loop(loop as number);
    }

    // 设置反弹
    if (bounce) {
      animate.bounce(true);
    }

    // 处理时间切片
    const slices = Array.isArray(timeSlices) ? timeSlices : [timeSlices];

    slices.forEach(slice => {
      this.applyTimeSliceToAnimate(slice, animate, graphic);
    });

    return animate;
  }

  /**
   * 将时间切片应用到动画实例
   */
  private applyTimeSliceToAnimate(slice: IAnimationTimeSlice, animate: IAnimate, graphic: IGraphic) {
    const { effects, duration = 300, delay = 0, delayAfter = 0 } = slice;

    // 解析时间参数
    const durationValue = duration as number;
    const delayValue = delay as number;
    const delayAfterValue = delayAfter as number;

    // 添加延迟
    if (delayValue > 0) {
      animate.wait(delayValue);
    }

    // 处理动画效果
    const effectsArray = Array.isArray(effects) ? effects : [effects];

    effectsArray.forEach(effect => {
      const { type = 'to', channel, custom, customParameters, easing = 'linear', options } = effect;

      // 根据 channel 配置创建属性对象
      const props = this.createPropsFromChannel(channel, graphic);

      if (type === 'to') {
        animate.to(props, durationValue, easing);
      } else if (type === 'from') {
        animate.from(props, durationValue, easing);
      } else if (custom) {
        // 处理自定义动画
        const customParams = this.resolveValue(customParameters, graphic, {});

        if (isFunction(custom)) {
          // 自定义插值器 - 创建自定义插值动画
          this.createCustomInterpolatorAnimation(
            animate,
            custom as IAnimationChannelInterpolator,
            props,
            durationValue,
            easing,
            customParams
          );
        } else {
          // 自定义动画构造器 - 创建自定义动画类
          this.createCustomAnimation(
            animate,
            custom as IAnimationCustomConstructor,
            props,
            durationValue,
            easing,
            customParams
          );
        }
      }
    });

    // 添加后延迟
    if (delayAfterValue > 0) {
      animate.wait(delayAfterValue);
    }
  }

  /**
   * 创建自定义插值器动画
   */
  private createCustomInterpolatorAnimation(
    animate: IAnimate,
    interpolator: IAnimationChannelInterpolator,
    props: Record<string, any>,
    duration: number,
    easing: EasingType,
    customParams: any
  ) {
    // 获取动画目标的当前属性作为起始值
    const from: Record<string, any> = {};
    const to = props;

    // 为每个属性填充起始值
    Object.keys(to).forEach(key => {
      from[key] = animate.target.getComputedAttribute(key);
    });

    animate.interpolateUpdateFunction = (from, to, ratio, step, target) => {
      interpolator(ratio, from, to, step, target, animate.target, customParams);
    };

    animate.to(props, duration, easing);
  }

  /**
   * 创建自定义动画类
   */
  private createCustomAnimation(
    animate: IAnimate,
    CustomAnimateConstructor: IAnimationCustomConstructor,
    props: Record<string, any>,
    duration: number,
    easing: EasingType,
    customParams: any
  ) {
    // 获取动画目标的当前属性作为起始值
    const from: Record<string, any> = {};
    const to = props;

    // 为每个属性填充起始值
    Object.keys(to).forEach(key => {
      from[key] = animate.target.getComputedAttribute(key);
    });

    // 实例化自定义动画类
    const customAnimate = new CustomAnimateConstructor(from, to, duration, easing, customParams);

    // 播放自定义动画
    animate.play(customAnimate);
  }

  /**
   * 从 channel 配置创建属性对象
   */
  private createPropsFromChannel(
    channel: IAnimationChannelAttrs | IAnimationChannelAttributes | undefined,
    graphic: IGraphic
  ): Record<string, any> {
    const props: Record<string, any> = {};

    if (!channel) {
      return props;
    }

    if (Array.isArray(channel)) {
      // 如果是属性数组，使用当前的属性值
      channel.forEach(attr => {
        props[attr] = graphic.getComputedAttribute(attr);
      });
    } else {
      // 如果是对象，解析 from/to 配置
      Object.entries(channel).forEach(([key, config]) => {
        if (config.to !== undefined) {
          if (typeof config.to === 'function') {
            props[key] = config.to((graphic.context as any)?.data, graphic, {});
          } else {
            props[key] = config.to;
          }
        }
      });
    }

    return props;
  }

  /**
   * 解析函数或值类型的配置项
   */
  private resolveValue<T>(value: MarkFunctionValueType<T> | undefined, graphic?: IGraphic, defaultValue?: T): T {
    if (value === undefined) {
      return defaultValue as T;
    }

    if (typeof value === 'function' && graphic) {
      return (value as MarkFunctionCallback<T>)((graphic.context as any)?.data, graphic, {});
    }

    return value as T;
  }

  /**
   * 执行动画（具体执行到内部的单个图元）
   */
  executeItem(params: IAnimationConfig, graphic: IGraphic, index: number = 0): IAnimate | null {
    if (!graphic) {
      return null;
    }

    const isTimeline = 'timeSlices' in params;
    let animate: IAnimate | null = null;

    if (isTimeline) {
      // 处理 Timeline 类型的动画配置
      animate = this.executeTimelineItem(params as IAnimationTimeline, graphic, index);
    } else {
      // 处理 TypeConfig 类型的动画配置
      animate = this.executeTypeConfigItem(params as IAnimationTypeConfig, graphic, index);
    }

    // 跟踪动画以进行生命周期管理
    if (animate) {
      this._trackAnimation(animate);
    }

    return animate;
  }

  /**
   * 停止所有由该执行器管理的动画
   */
  stop(): void {
    this._animates.forEach(animate => {
      animate.stop();
    });

    // 清空动画实例数组
    this._animates = [];
    this._activeCount = 0;

    // 如果动画正在运行，触发结束回调
    if (this._started) {
      this._started = false;
      this.onEnd();
    }
  }
}
