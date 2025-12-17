import { type IGraphic, type EasingType, type IAnimate, AnimateStatus } from '@visactor/vrender-core';
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
import { cloneDeep, isArray, isFunction } from '@visactor/vutils';
import { getCustomType } from './utils';

interface IAnimateExecutor {
  execute: (params: IAnimationConfig) => void;
  executeItem: (params: IAnimationConfig, graphic: IGraphic, index?: number) => IAnimate[];
  onStart: (cb?: () => void) => void;
  onEnd: (cb?: () => void) => void;
}

export class AnimateExecutor implements IAnimateExecutor {
  static builtInAnimateMap: Record<string, IAnimationCustomConstructor> = {};

  static registerBuiltInAnimate(name: string, animate: IAnimationCustomConstructor) {
    AnimateExecutor.builtInAnimateMap[name] = animate;
  }

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

  get started(): boolean {
    return this._started;
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

  parseParams(params: IAnimationConfig, isTimeline: boolean, child?: IGraphic): IAnimationConfig {
    const totalTime = this.resolveValue(params.totalTime, undefined, undefined);
    const startTime = this.resolveValue(params.startTime, undefined, 0);

    // execute只在mark层面调用，所以性能影响可以忽略
    // TODO 存在性能问题，如果后续调用频繁，需要重新修改
    const parsedParams: Record<string, any> = { ...params };
    parsedParams.oneByOneDelay = 0;
    parsedParams.startTime = startTime;
    parsedParams.totalTime = totalTime;

    const oneByOne = this.resolveValue(params.oneByOne, child, false);

    if (isTimeline) {
      const timeSlices = (parsedParams as IAnimationTimeline).timeSlices;
      if (!isArray(timeSlices)) {
        (parsedParams as IAnimationTimeline).timeSlices = [timeSlices];
      }
      let sliceTime = 0;
      ((parsedParams as IAnimationTimeline).timeSlices as IAnimationTimeSlice[]) = (
        (parsedParams as IAnimationTimeline).timeSlices as IAnimationTimeSlice[]
      ).map(slice => {
        const delay = this.resolveValue(slice.delay, child, 0);
        const delayAfter = this.resolveValue(slice.delayAfter, child, 0);
        const duration = this.resolveValue(slice.duration, child, 300);
        sliceTime += delay + duration + delayAfter;
        return {
          ...slice,
          delay,
          delayAfter,
          duration
        };
      });
      let oneByOneDelay = 0;
      if (oneByOne) {
        oneByOneDelay = typeof oneByOne === 'number' ? (oneByOne as number) : oneByOne ? sliceTime : 0;
      }
      parsedParams.oneByOneDelay = oneByOneDelay;

      let scale = 1;
      if (totalTime) {
        const _totalTime = sliceTime + oneByOneDelay * (this._target.count - 2);
        scale = totalTime ? totalTime / _totalTime : 1;
      }
      ((parsedParams as IAnimationTimeline).timeSlices as IAnimationTimeSlice[]) = (
        (parsedParams as IAnimationTimeline).timeSlices as IAnimationTimeSlice[]
      ).map(slice => {
        let effects = slice.effects;
        if (!Array.isArray(effects)) {
          effects = [effects];
        }
        return {
          ...slice,
          delay: (slice.delay as number) * scale,
          delayAfter: (slice.delayAfter as number) * scale,
          duration: (slice.duration as number) * scale,
          effects: effects.map(effect => {
            const custom = effect.custom ?? AnimateExecutor.builtInAnimateMap[(effect.type as any) ?? 'fromTo'];
            const customType = getCustomType(custom);
            return {
              ...effect,
              custom,
              customType
            };
          })
        };
      });
      parsedParams.oneByOneDelay = oneByOneDelay * scale;
      (parsedParams as IAnimationTimeline).startTime = startTime * scale;
    } else {
      const delay = this.resolveValue((params as IAnimationTypeConfig).delay, child, 0);
      const delayAfter = this.resolveValue((params as IAnimationTypeConfig).delayAfter, child, 0);
      const duration = this.resolveValue((params as IAnimationTypeConfig).duration, child, 300);
      const loopTime = delay + delayAfter + duration;

      let oneByOneDelay = 0;
      if (oneByOne) {
        oneByOneDelay = typeof oneByOne === 'number' ? (oneByOne as number) : oneByOne ? loopTime : 0;
      }
      parsedParams.oneByOneDelay = oneByOneDelay;
      parsedParams.custom =
        (params as IAnimationTypeConfig).custom ??
        AnimateExecutor.builtInAnimateMap[(params as IAnimationTypeConfig).type ?? 'fromTo'];

      const customType = getCustomType(parsedParams.custom);
      parsedParams.customType = customType;

      if (totalTime) {
        const _totalTime = delay + delayAfter + duration + oneByOneDelay * (this._target.count - 2);
        const scale = totalTime ? totalTime / _totalTime : 1;
        parsedParams.delay = delay * scale;
        parsedParams.delayAfter = delayAfter * scale;
        parsedParams.duration = duration * scale;
        parsedParams.oneByOneDelay = oneByOneDelay * scale;
        (parsedParams as IAnimationTypeConfig).startTime = startTime;
      }
    }

    return parsedParams;
  }

  execute(params: IAnimationConfig | IAnimationConfig[]) {
    if (Array.isArray(params)) {
      params.forEach(param => this._execute(param));
    } else {
      this._execute(params);
    }
  }

  /**
   * 执行动画，针对一组元素
   */
  _execute(params: IAnimationConfig) {
    if (params.selfOnly) {
      return this._executeItem(params, this._target, 0, 1);
    }

    // 判断是否为timeline配置
    const isTimeline = 'timeSlices' in params;

    // 筛选符合条件的子图元
    let filteredChildren: IGraphic[];

    // 如果设置了partitioner，则进行筛选
    if (isTimeline && params.partitioner) {
      filteredChildren = (filteredChildren ?? (this._target.getChildren() as IGraphic[])).filter(child => {
        return (params as IAnimationTimeline).partitioner((child.context as any)?.data?.[0], child, {});
      });
    }

    // 如果需要排序，则进行排序
    if (isTimeline && (params as IAnimationTimeline).sort) {
      filteredChildren = filteredChildren ?? (this._target.getChildren() as IGraphic[]);
      filteredChildren.sort((a, b) => {
        return (params as IAnimationTimeline).sort(
          (a.context as any)?.data?.[0],
          (b.context as any)?.data?.[0],
          a,
          b,
          {}
        );
      });
    }

    //

    const cb = isTimeline
      ? (child: IGraphic, index: number, count: number) => {
          const parsedParams = this.parseParams(params, isTimeline, child);
          // 执行单个图元的timeline动画
          const animate = this.executeTimelineItem(parsedParams as IAnimationTimeline, child, index, count);
          if (animate) {
            this._trackAnimation(animate);
          }
        }
      : (child: IGraphic, index: number, count: number) => {
          const parsedParams = this.parseParams(params, isTimeline, child);
          // 执行单个图元的config动画
          const animate = this.executeTypeConfigItem(parsedParams as IAnimationTypeConfig, child, index, count);
          if (animate) {
            this._trackAnimation(animate);
          }
        };

    // 执行每个图元的动画
    if (filteredChildren) {
      filteredChildren.forEach((child, index) => cb(child, index, filteredChildren.length));
    } else if (this._target.count <= 1) {
      cb(this._target, 0, 1);
    } else {
      this._target.forEachChildren((child, index) => cb(child as IGraphic, index, this._target.count - 1));
    }

    return;
  }

  /**
   * 执行 TypeConfig 类型的动画
   */
  private executeTypeConfigItem(
    params: IAnimationTypeConfig,
    graphic: IGraphic,
    index: number,
    count: number
  ): IAnimate {
    const {
      type = 'fromTo',
      channel,
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
      custom,
      customType, // 0: undefined, 1: class, 2: function
      controlOptions
    } = params as any;

    // 创建动画实例
    const animate = graphic.animate() as unknown as IAnimate;
    animate.priority = priority;

    const delayValue = isFunction(delay) ? delay(graphic.context?.data?.[0], graphic, {}) : delay;

    // 如果设置了indexKey，则使用indexKey作为index
    const datum = graphic.context?.data?.[0];
    const indexKey = graphic.context?.indexKey;
    if (datum && indexKey) {
      index = datum[indexKey] ?? index;
    }

    // 设置开始时间
    animate.startAt(startTime as number);
    const wait = index * oneByOneDelay + delayValue;
    wait > 0 && animate.wait(wait);

    // 放到startAt中，否则label无法确定主图元何时开始
    // // 添加延迟
    // if (delayValue > 0) {
    //   animate.wait(delayValue);
    // }

    // 根据 channel 配置创建属性对象
    // 根据 channel 配置创建属性对象
    let parsedFromProps = null;
    let props = params.to;
    let from = params.from;
    if (!props) {
      if (!parsedFromProps) {
        parsedFromProps = this.createPropsFromChannel(channel, graphic);
      }
      props = parsedFromProps.props;
    }
    if (!from) {
      if (!parsedFromProps) {
        parsedFromProps = this.createPropsFromChannel(channel, graphic);
      }
      from = parsedFromProps.from;
    }

    this._handleRunAnimate(
      animate,
      custom,
      customType,
      from,
      props,
      duration as number,
      easing,
      customParameters,
      controlOptions,
      options,
      type,
      graphic
    );

    let totalDelay = 0;
    if (oneByOneDelay) {
      totalDelay = oneByOneDelay * (count - index - 1);
    }

    // 添加后延迟
    const delayAfterValue = isFunction(delayAfter) ? delayAfter(graphic.context?.data?.[0], graphic, {}) : delayAfter;
    if (delayAfterValue > 0) {
      totalDelay += delayAfterValue as number;
    }

    if (totalDelay > 0) {
      animate.wait(totalDelay);
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

  private _handleRunAnimate(
    animate: IAnimate,
    custom: IAnimationCustomConstructor | IAnimationChannelInterpolator,
    customType: number, // 0: undefined, 1: class, 2: function
    from: Record<string, any> | null,
    props: Record<string, any>,
    duration: number,
    easing: EasingType,
    customParameters: any,
    controlOptions: any,
    options: any,
    type: string,
    graphic: IGraphic
  ) {
    // 处理自定义动画
    if (custom && customType) {
      const _customParameters = this.resolveValue(customParameters, graphic);
      let customParams = _customParameters;
      if (typeof customParams === 'function') {
        customParams = customParams(graphic.context?.data?.[0], graphic, {});
      }
      customParams = {
        width: graphic.stage?.width || 0,
        height: graphic.stage?.height || 0,
        group: this._target.parent,
        ...customParams
      };

      const objOptions = isFunction(options)
        ? options.call(
            null,
            (customParams && customParams.data?.[0]) ?? graphic.context?.data?.[0],
            graphic,
            customParams
          )
        : options;
      customParams.options = objOptions;
      customParams.controlOptions = controlOptions;
      if (customType === 1) {
        // 自定义动画构造器 - 创建自定义动画类
        this.createCustomAnimation(
          animate,
          custom as IAnimationCustomConstructor,
          from,
          props,
          duration as number,
          easing,
          customParams
        );
      } else if (customType === 2) {
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
    } else if (type === 'to') {
      animate.to(props, duration as number, easing);
    } else if (type === 'from') {
      animate.from(props, duration as number, easing);
    }
  }

  /**
   * 执行 Timeline 类型的动画
   */
  private executeTimelineItem(params: IAnimationTimeline, graphic: IGraphic, index: number, count: number): IAnimate {
    const { timeSlices, startTime = 0, loop, bounce, oneByOneDelay, priority, controlOptions } = params as any;

    // 如果设置了indexKey，则使用indexKey作为index
    const datum = graphic.context?.data?.[0];
    const indexKey = graphic.context?.indexKey;
    if (datum && indexKey) {
      index = datum[indexKey] ?? index;
    }

    // 创建动画实例
    const animate = graphic.animate() as unknown as IAnimate;
    animate.priority = priority;

    // 设置开始时间
    animate.startAt(startTime as number);
    animate.wait(index * oneByOneDelay);

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
      this.applyTimeSliceToAnimate(slice, animate, graphic, controlOptions);
    });

    // 后等待
    if (oneByOneDelay) {
      animate.wait(oneByOneDelay * (count - index - 1));
    }

    return animate;
  }

  /**
   * 将时间切片应用到动画实例
   */
  private applyTimeSliceToAnimate(
    slice: IAnimationTimeSlice,
    animate: IAnimate,
    graphic: IGraphic,
    controlOptions: any
  ) {
    const { effects, duration = 300, delay = 0, delayAfter = 0 } = slice;

    // 解析时间参数
    // const durationValue = duration as number;
    const delayValue = isFunction(delay) ? delay(graphic.context?.data?.[0], graphic, {}) : delay;
    const delayAfterValue = isFunction(delayAfter) ? delayAfter(graphic.context?.data?.[0], graphic, {}) : delayAfter;

    // 添加延迟
    if (delayValue > 0) {
      animate.wait(delayValue);
    }

    // 处理动画效果
    const effectsArray = Array.isArray(effects) ? effects : [effects];

    effectsArray.forEach(effect => {
      const { type = 'fromTo', channel, customParameters, easing = 'linear', options } = effect;

      // 根据 channel 配置创建属性对象
      let parsedFromProps = null;
      let props = effect.to;
      let from = effect.from;
      if (!props) {
        if (!parsedFromProps) {
          parsedFromProps = this.createPropsFromChannel(channel, graphic);
        }
        props = parsedFromProps.props;
      }
      if (!from) {
        if (!parsedFromProps) {
          parsedFromProps = this.createPropsFromChannel(channel, graphic);
        }
        from = parsedFromProps.from;
      }
      const custom = effect.custom ?? AnimateExecutor.builtInAnimateMap[type];
      const customType = effect.custom ? (effect as any).customType : getCustomType(custom);
      this._handleRunAnimate(
        animate,
        custom,
        customType,
        from,
        props,
        duration as number,
        easing,
        customParameters,
        controlOptions,
        options,
        type,
        graphic
      );
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
    from: Record<string, any> | null,
    props: Record<string, any>,
    duration: number,
    easing: EasingType,
    customParams: any
  ) {
    // 获取动画目标的当前属性作为起始值
    // const from: Record<string, any> = {};
    const to = props;

    // // 为每个属性填充起始值
    // Object.keys(to).forEach(key => {
    //   from[key] = animate.target.getComputedAttribute(key);
    // });

    // 实例化自定义动画类
    // 自定义动画自己去计算from
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
  ): { from: Record<string, any> | null; props: Record<string, any> } {
    const props: Record<string, any> = {};
    let from: Record<string, any> | null = null;

    if (!channel) {
      return {
        from,
        props
      };
    }

    if (!Array.isArray(channel)) {
      // 如果是对象，解析 from/to 配置
      Object.keys(channel).forEach(key => {
        const config = channel[key];
        if (config.to !== undefined) {
          if (typeof config.to === 'function') {
            props[key] = config.to((graphic.context as any)?.data?.[0], graphic, {});
          } else {
            props[key] = config.to;
          }
        }
        if (config.from !== undefined) {
          if (!from) {
            from = {};
          }
          if (typeof config.from === 'function') {
            from[key] = config.from((graphic.context as any)?.data?.[0], graphic, {});
          } else {
            from[key] = config.from;
          }
        }
      });
    } else {
      channel.forEach(key => {
        const value = graphic.context?.diffAttrs?.[key];
        if (value !== undefined) {
          props[key] = value;
        }
      });
    }

    return {
      from,
      props
    };
  }

  /**
   * 解析函数或值类型的配置项
   */
  private resolveValue<T>(value: MarkFunctionValueType<T> | undefined, graphic?: IGraphic, defaultValue?: T): T {
    if (value === undefined) {
      return defaultValue as T;
    }

    if (typeof value === 'function' && graphic) {
      return (value as MarkFunctionCallback<T>)((graphic.context as any)?.data?.[0], graphic, {});
    }

    return value as T;
  }

  executeItem(params: IAnimationConfig | IAnimationConfig[], graphic: IGraphic, index: number = 0, count: number = 1) {
    if (Array.isArray(params)) {
      return params.map(param => this._executeItem(param, graphic, index, count)).filter(Boolean);
    }
    return [this._executeItem(params, graphic, index, count)].filter(Boolean);
  }

  /**
   * 执行动画（具体执行到内部的单个图元）
   */
  _executeItem(params: IAnimationConfig, graphic: IGraphic, index: number = 0, count: number = 1): IAnimate | null {
    if (!graphic) {
      return null;
    }

    const isTimeline = 'timeSlices' in params;
    let animate: IAnimate | null = null;

    const parsedParams = this.parseParams(params, isTimeline);

    if (isTimeline) {
      // 处理 Timeline 类型的动画配置
      animate = this.executeTimelineItem(parsedParams as IAnimationTimeline, graphic, index, count);
    } else {
      // 处理 TypeConfig 类型的动画配置
      animate = this.executeTypeConfigItem(parsedParams as IAnimationTypeConfig, graphic, index, count);
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
  stop(type?: 'start' | 'end' | Record<string, any>, callEnd: boolean = true): void {
    // animate.stop会从数组里删除，所以需要while循环，不能forEach
    while (this._animates.length > 0) {
      const animate = this._animates.pop();
      // 不执行回调时 标记动画为结束状态
      callEnd === false && (animate.status = AnimateStatus.END);
      animate?.stop(type);
    }

    // 清空动画实例数组
    this._animates = [];
    this._activeCount = 0;

    // 如果动画正在运行，触发结束回调
    if (this._started) {
      this._started = false;
      callEnd && this.onEnd();
    }
  }
}
