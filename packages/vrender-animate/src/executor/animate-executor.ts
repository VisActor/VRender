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
import { ACustomAnimate } from '../custom/custom-animate';
import type { EasingType } from '../intreface/easing';
import type { IAnimate } from '../intreface/animate';
import { cloneDeep, isArray, scale } from '@visactor/vutils';

export class AnimateExecutor {
  declare _target: IGroup;

  constructor(target: IGroup) {
    this._target = target;
  }

  /**
   * 执行动画，针对图元组
   * 1. oneByOne 为 true 时，内部图元依次执行动画，每个图元通过（duration，delay，delayAfter）来控制自身动画的执行
   * 2. totalTime为总时长（如果有oneByOne的话，从开始到最后一个图元动画结束的时长为totalTime），如果配置了totalTime，那么duration，delay，delayAfter会根据totalTime进行等比缩放
   * 3. 如果配置了partitioner，则根据partitioner进行筛选子图元再执行动画
   */
  execute(params: IAnimationConfig) {
    // 判断是否为timeline配置
    const isTimeline = 'timeSlices' in params;

    // 获取子图元
    if (this._target.count <= 1) {
      return;
    }

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
          this.executeTimelineItem(parsedParams as IAnimationTimeline, child, index);
        }
      : (child: IGraphic, index: number) => {
          // 执行单个图元的config动画
          this.executeTypeConfigItem(parsedParams as IAnimationTypeConfig, child, index);
        };

    // 执行每个图元的动画
    if (filteredChildren) {
      filteredChildren.forEach(cb);
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
      options,
      controlOptions
    } = params as any;

    // 创建动画实例
    const animate = graphic.animate() as unknown as IAnimate;

    const delayValue = delay as number;

    // 设置开始时间
    animate.startAt((startTime as number) + index * oneByOneDelay);

    // 添加延迟
    if (delayValue > 0) {
      animate.wait(delayValue);
    }

    // 根据 channel 配置创建属性对象
    const props = this.createPropsFromChannel(channel, graphic);

    if (type === 'to') {
      animate.to(props, duration as number, easing);
    } else if (type === 'from') {
      animate.from(props, duration as number, easing);
    } else if (custom) {
      // 处理自定义动画
      const customParams = this.resolveValue(customParameters, graphic, {});

      if (typeof custom === 'function') {
        // 自定义插值器 - 创建自定义插值动画
        this.createCustomInterpolatorAnimation(
          animate,
          custom as IAnimationChannelInterpolator,
          props,
          duration as number,
          easing,
          customParams
        );
      } else {
        // 自定义动画构造器 - 创建自定义动画类
        this.createCustomAnimation(
          animate,
          custom as IAnimationCustomConstructor,
          props,
          duration as number,
          easing,
          customParams
        );
      }
    }

    // 添加后延迟
    if ((delayAfter as number) > 0) {
      animate.wait(delayAfter as number);
    }

    // 设置循环
    if (loop && (loop as number) > 0) {
      animate.loop(loop as number);
    }

    return animate;
  }

  /**
   * 执行 Timeline 类型的动画
   */
  private executeTimelineItem(params: IAnimationTimeline, graphic: IGraphic, index: number): IAnimate {
    const { timeSlices, startTime = 0, loop, oneByOneDelay, controlOptions } = params as any;

    // 创建动画实例
    const animate = graphic.animate() as unknown as IAnimate;

    // 设置开始时间
    animate.startAt((startTime as number) + index * oneByOneDelay);

    // 设置循环
    if (loop && (loop as number) > 0) {
      animate.loop(loop as number);
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

        if (typeof custom === 'function') {
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

    // 创建自定义动画步骤
    // 注意：这里需要设计一个特殊的自定义动画类来处理插值器函数
    class CustomInterpolatorAnimate extends ACustomAnimate<Record<string, any>> {
      interpolator: IAnimationChannelInterpolator;
      parameters: any;

      constructor(
        from: Record<string, any>,
        to: Record<string, any>,
        duration: number,
        easing: EasingType,
        interpolator: IAnimationChannelInterpolator,
        parameters: any
      ) {
        super(from, to, duration, easing, parameters);
        this.interpolator = interpolator;
        this.parameters = parameters;
        this.setProps(to);
      }

      onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
        // 调用插值器函数进行自定义插值
        this.interpolator(
          ratio,
          this.customFrom,
          this.props,
          out,
          (this.target.context as any)?.data,
          this.target,
          this.parameters
        );
      }
    }

    // 创建并添加自定义插值动画
    const customAnimate = new CustomInterpolatorAnimate(from, to, duration, easing, interpolator, customParams);

    animate.play(customAnimate);
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
  executeItem(params: IAnimationConfig, graphic: IGraphic, index: number): IAnimate | null {
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

    return animate;
  }
}
