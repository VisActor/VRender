import { FadeIn } from './fade';
import type { EasingType, IGraphicAttribute } from '@visactor/vrender-core';
import { ACustomAnimate } from './custom-animate';
import { AnimateExecutor } from '../executor/animate-executor';
import { ColorStore, ColorType, interpolateColor } from '@visactor/vrender-core';

export class StoryFadeIn extends FadeIn {}

// 滑动动画的参数接口
export interface ISlideAnimationOptions {
  direction?: 'top' | 'bottom' | 'left' | 'right';
  distance?: number;
  fromOpacity?: number; // 透明度初始值，默认0
}

// 缩放动画的参数接口
export interface IGrowAnimationOptions {
  fromScale?: number;
  direction?: 'x' | 'y' | 'xy';
  fromOpacity?: number; // 透明度初始值，默认0
}

// 旋转动画的参数接口
export interface ISpinAnimationOptions {
  fromAngle?: number;
  fromScale?: number;
  fromOpacity?: number; // 透明度初始值，默认0
}

// 描边动画的参数接口
export interface IStrokeAnimationOptions {
  lineWidth?: number; // 描边宽度，默认2
  strokeColor?: string; // 描边颜色，默认黑色
  fromOpacity?: number; // 透明度初始值，默认1
  dashLength?: number; // 虚线长度，默认为元素周长
  showFill?: boolean; // 是否显示填充，默认false
  fillOpacity?: number; // 填充透明度，仅当showFill为true时有效
}

// 脉冲/强调动画的参数接口
export interface IPulseAnimationOptions {
  pulseCount?: number; // 脉冲次数
  pulseOpacity?: number; // 脉冲透明度，默认0.3
  pulseScale?: number; // 缩放比例，默认1.05
  pulseColor?: string; // 脉冲颜色，默认为元素自身颜色
  pulseColorIntensity?: number; // 脉冲颜色强度，0-1，默认0.2
  strokeOnly?: boolean; // 是否只应用于描边，默认false
  fillOnly?: boolean; // 是否只应用于填充，默认false
  useScale?: boolean; // 是否使用缩放效果，默认true
  useOpacity?: boolean; // 是否使用透明度效果，默认true
  useColor?: boolean; // 是否使用颜色效果，默认false
  useStroke?: boolean; // 是否使用描边效果，默认true
  useFill?: boolean; // 是否使用填充效果，默认true
}

/**
 * 滑动入场动画，包括从上到下，从下到上，从左到右，从右到左的位置，以及透明度属性插值
 */
export class SlideIn extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;
  declare propKeys: string[];
  declare from: Record<string, number>;
  declare to: Record<string, number>;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: ISlideAnimationOptions) {
    super(from, to, duration, easing, params);
  }

  onBind(): void {
    super.onBind();
    // 用于入场的时候设置属性
    const attrs = this.target.getFinalAttribute();

    const direction = (this.params?.direction as 'top' | 'bottom' | 'left' | 'right') || 'right';
    const distance = this.params?.distance || 50;
    const fromOpacity = this.params?.fromOpacity ?? 0; // 使用透明度初始值参数

    // 初始化from和to对象
    const from: Record<string, number> = { opacity: fromOpacity, baseOpacity: fromOpacity };
    const to: Record<string, number> = { opacity: 1, baseOpacity: 1 };

    // 根据方向设置对应的属性
    if (direction === 'top') {
      from.y = (attrs.y ?? 0) - distance;
      to.y = attrs.y ?? 0;
      this.propKeys = ['opacity', 'baseOpacity', 'y'];
    } else if (direction === 'bottom') {
      from.y = (attrs.y ?? 0) + distance;
      to.y = attrs.y ?? 0;
      this.propKeys = ['opacity', 'baseOpacity', 'y'];
    } else if (direction === 'left') {
      from.x = (attrs.x ?? 0) - distance;
      to.x = attrs.x ?? 0;
      this.propKeys = ['opacity', 'baseOpacity', 'x'];
    } else {
      // right
      from.x = (attrs.x ?? 0) + distance;
      to.x = attrs.x ?? 0;
      this.propKeys = ['opacity', 'baseOpacity', 'x'];
    }

    this.from = from;
    this.to = to;
    this.props = to;

    // 将初始属性应用到目标对象
    this.target.setAttributes(from as any);
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    const attribute: Record<string, any> = this.target.attribute;
    this.propKeys.forEach(key => {
      attribute[key] = this.from[key] + (this.to[key] - this.from[key]) * ratio;
    });
    this.target.addUpdatePositionTag();
    this.target.addUpdateShapeAndBoundsTag();
  }
}

/**
 * 缩放入场动画，包括scaleX、scaleY属性从某个比例缩放到1，该比例可以小于1也可以大于1，以及透明度属性插值
 */
export class GrowIn extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;
  declare propKeys: string[];
  declare from: Record<string, number>;
  declare to: Record<string, number>;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IGrowAnimationOptions) {
    super(from, to, duration, easing, params);
  }

  onBind(): void {
    super.onBind();
    // 用于入场的时候设置属性
    const attrs = this.target.getFinalAttribute();

    const fromScale = this.params?.fromScale ?? 0;
    const direction = this.params?.direction || 'xy';
    const fromOpacity = this.params?.fromOpacity ?? 0; // 使用透明度初始值参数

    // 初始化from和to对象
    const from: Record<string, number> = { opacity: fromOpacity, baseOpacity: fromOpacity };
    const to: Record<string, number> = { opacity: 1, baseOpacity: 1 };
    this.propKeys = ['opacity', 'baseOpacity'];

    // 根据方向设置对应的缩放属性
    if (direction === 'x' || direction === 'xy') {
      from.scaleX = fromScale;
      to.scaleX = attrs.scaleX ?? 1;
      this.propKeys.push('scaleX');
    }

    if (direction === 'y' || direction === 'xy') {
      from.scaleY = fromScale;
      to.scaleY = attrs.scaleY ?? 1;
      this.propKeys.push('scaleY');
    }

    this.from = from;
    this.to = to;
    this.props = to;

    // 将初始属性应用到目标对象
    this.target.setAttributes(from as any);
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    const attribute: Record<string, any> = this.target.attribute;
    this.propKeys.forEach(key => {
      attribute[key] = this.from[key] + (this.to[key] - this.from[key]) * ratio;
    });
    this.target.addUpdatePositionTag();
    this.target.addUpdateShapeAndBoundsTag();
  }
}

/**
 * 旋转入场动画，包括rotate属性从某个角度度旋转到0，以及缩放属性从某个比例缩放到1，该比例可以小于1也可以大于1
 */
export class SpinIn extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;
  declare propKeys: string[];
  declare from: Record<string, number>;
  declare to: Record<string, number>;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: ISpinAnimationOptions) {
    super(from, to, duration, easing, params);
  }

  onBind(): void {
    super.onBind();
    // 用于入场的时候设置属性
    const attrs = this.target.getFinalAttribute();

    const fromAngle = this.params?.fromAngle ?? Math.PI * 2; // 默认旋转一圈
    const fromScale = this.params?.fromScale ?? 0;
    const fromOpacity = this.params?.fromOpacity ?? 0; // 使用透明度初始值参数

    // 初始化from和to对象
    const from: Record<string, number> = {
      opacity: fromOpacity,
      baseOpacity: fromOpacity,
      angle: fromAngle,
      scaleX: fromScale,
      scaleY: fromScale
    };

    const to: Record<string, number> = {
      opacity: 1,
      baseOpacity: 1,
      angle: attrs.angle ?? 0,
      scaleX: attrs.scaleX ?? 1,
      scaleY: attrs.scaleY ?? 1
    };

    this.propKeys = ['opacity', 'baseOpacity', 'angle', 'scaleX', 'scaleY'];
    this.from = from;
    this.to = to;
    this.props = to;

    // 将初始属性应用到目标对象
    this.target.setAttributes(from as any);
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    const attribute: Record<string, any> = this.target.attribute;
    this.propKeys.forEach(key => {
      attribute[key] = this.from[key] + (this.to[key] - this.from[key]) * ratio;
    });
    this.target.addUpdatePositionTag();
    this.target.addUpdateShapeAndBoundsTag();
  }
}

/**
 * 描边入场动画，使用lineDashOffset实现描边效果
 * 通过调整虚线偏移量，创建线条逐渐显示的动画效果
 */
export class StrokeIn extends ACustomAnimate<Record<string, any>> {
  declare valid: boolean;
  declare propKeys: string[];
  declare from: Record<string, any>;
  declare to: Record<string, any>;
  private perimeter: number = 0;
  private originalAttributes: Record<string, any> = {};

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IStrokeAnimationOptions) {
    super(from, to, duration, easing, params);
  }

  onBind(): void {
    super.onBind();
    // 保存原始属性
    this.originalAttributes = { ...this.target.getAttributes() };

    // 获取图形周长
    if (this.target.type === 'rect') {
      const attr = this.target.attribute as any;
      const width = attr.width ?? 100;
      const height = attr.height ?? 100;
      this.perimeter = 2 * (width + height);
    } else if (this.target.type === 'circle') {
      const attr = this.target.attribute as any;
      const radius = attr.radius ?? 50;
      this.perimeter = 2 * Math.PI * radius;
    } else if (this.target.type === 'ellipse') {
      const attr = this.target.attribute as any;
      const radiusX = attr.radiusX ?? 50;
      const radiusY = attr.radiusY ?? 50;
      // 椭圆周长近似计算
      this.perimeter = 2 * Math.PI * Math.sqrt((radiusX * radiusX + radiusY * radiusY) / 2);
    } else {
      // 对于其他形状，使用默认值
      this.perimeter = 1000;
    }

    const lineWidth = this.params?.lineWidth ?? 2;
    const strokeColor = this.params?.strokeColor ?? 'black';
    const fromOpacity = this.params?.fromOpacity ?? 1;
    const dashLength = this.params?.dashLength ?? this.perimeter;
    const showFill = this.params?.showFill ?? false;
    const fillOpacity = this.params?.fillOpacity ?? 0;

    // 设置初始状态
    this.from = {
      lineDash: [dashLength, dashLength],
      lineDashOffset: dashLength,
      lineWidth,
      stroke: strokeColor,
      strokeOpacity: fromOpacity
    };

    // 设置目标状态
    this.to = {
      lineDash: [dashLength, dashLength],
      lineDashOffset: 0,
      lineWidth,
      stroke: strokeColor,
      strokeOpacity: fromOpacity
    };

    // 如果需要显示填充，添加填充相关属性
    if (showFill) {
      this.from.fillOpacity = fillOpacity;
      this.to.fillOpacity = this.originalAttributes.fillOpacity ?? 1;
    } else {
      this.from.fillOpacity = 0;
      this.to.fillOpacity = 0;
    }

    this.propKeys = ['lineDash', 'lineDashOffset', 'lineWidth', 'stroke', 'strokeOpacity', 'fillOpacity'];
    this.props = this.to;

    // 应用初始属性
    this.target.setAttributes(this.from);
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    const attribute: Record<string, any> = this.target.attribute;

    // 更新lineDashOffset
    attribute.lineDashOffset = this.from.lineDashOffset + (this.to.lineDashOffset - this.from.lineDashOffset) * ratio;

    // 更新fillOpacity (如果需要显示填充)
    if (this.params?.showFill) {
      attribute.fillOpacity = this.from.fillOpacity + (this.to.fillOpacity - this.from.fillOpacity) * ratio;
    }
  }

  onEnd(): void {
    super.onEnd();
    // 动画结束后，是否要恢复原始属性
    if (!this.params?.showFill) {
      // 如果不显示填充，恢复原始的stroke属性但保持fillOpacity为0
      const originalAttrs = { ...this.originalAttributes };
      originalAttrs.fillOpacity = 0;
      this.target.setAttributes(originalAttrs);
    }
  }
}

/**
 * 描边出场动画，使用lineDashOffset实现描边消失效果
 */
export class StrokeOut extends ACustomAnimate<Record<string, any>> {
  declare valid: boolean;
  declare propKeys: string[];
  declare from: Record<string, any>;
  declare to: Record<string, any>;
  private perimeter: number = 0;
  private originalAttributes: Record<string, any> = {};

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IStrokeAnimationOptions) {
    super(from, to, duration, easing, params);
  }

  onFirstRun(): void {
    // 保存原始属性
    this.originalAttributes = { ...this.target.getAttributes() };

    // 获取图形周长
    if (this.target.type === 'rect') {
      const attr = this.target.attribute as any;
      const width = attr.width ?? 100;
      const height = attr.height ?? 100;
      this.perimeter = 2 * (width + height);
    } else if (this.target.type === 'circle') {
      const attr = this.target.attribute as any;
      const radius = attr.radius ?? 50;
      this.perimeter = 2 * Math.PI * radius;
    } else if (this.target.type === 'ellipse') {
      const attr = this.target.attribute as any;
      const radiusX = attr.radiusX ?? 50;
      const radiusY = attr.radiusY ?? 50;
      // 椭圆周长近似计算
      this.perimeter = 2 * Math.PI * Math.sqrt((radiusX * radiusX + radiusY * radiusY) / 2);
    } else {
      // 对于其他形状，使用默认值
      this.perimeter = 1000;
    }

    const lineWidth = this.params?.lineWidth ?? 2;
    const strokeColor = this.params?.strokeColor ?? 'black';
    const fromOpacity = this.params?.fromOpacity ?? 1;
    const dashLength = this.params?.dashLength ?? this.perimeter;
    const showFill = this.params?.showFill ?? false;

    // 设置初始状态 - 完全显示的描边
    this.from = {
      lineDash: [dashLength, dashLength],
      lineDashOffset: 0,
      lineWidth,
      stroke: strokeColor,
      strokeOpacity: fromOpacity
    };

    // 设置目标状态 - 完全消失的描边
    this.to = {
      lineDash: [dashLength, dashLength],
      lineDashOffset: -dashLength,
      lineWidth,
      stroke: strokeColor,
      strokeOpacity: fromOpacity
    };

    // 处理填充
    if (showFill) {
      this.from.fillOpacity = this.originalAttributes.fillOpacity ?? 1;
      this.to.fillOpacity = 0;
    } else {
      this.from.fillOpacity = 0;
      this.to.fillOpacity = 0;
    }

    this.propKeys = ['lineDash', 'lineDashOffset', 'lineWidth', 'stroke', 'strokeOpacity', 'fillOpacity'];
    this.props = this.to;

    // 应用初始属性
    this.target.setAttributes(this.from);
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    const attribute: Record<string, any> = this.target.attribute;

    // 更新lineDashOffset
    attribute.lineDashOffset = this.from.lineDashOffset + (this.to.lineDashOffset - this.from.lineDashOffset) * ratio;

    // 更新fillOpacity (如果有)
    if (this.params?.showFill) {
      attribute.fillOpacity = this.from.fillOpacity + (this.to.fillOpacity - this.from.fillOpacity) * ratio;
    }
  }
}

// 复合动画的参数接口
export interface IMoveScaleAnimationOptions {
  slideDirection?: 'top' | 'bottom' | 'left' | 'right';
  slideDistance?: number;
  fromScale?: number;
  scaleDirection?: 'x' | 'y' | 'xy';
  slideRatio?: number; // 滑动动画占总时长的比例，默认0.5
  fromOpacity?: number; // 透明度初始值，默认0
}

/**
 * 移动+缩放入场动画
 * 先走SlideIn，然后走GrowIn
 */
export class MoveScaleIn extends ACustomAnimate<any> {
  declare valid: boolean;
  private readonly slideInDuration: number;
  private readonly growInDuration: number;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IMoveScaleAnimationOptions) {
    super(from, to, duration, easing, params);
    const slideRatio = params?.slideRatio ?? 0.5;
    this.slideInDuration = duration * slideRatio;
    this.growInDuration = duration * (1 - slideRatio);
  }

  onBind(): void {
    super.onBind();
    // 创建AnimateExecutor来运行序列动画
    const executor = new AnimateExecutor(this.target);

    // 第一步：滑动入场（包含透明度变化）
    executor.execute({
      type: 'custom',
      custom: SlideIn,
      customParameters: {
        direction: this.params?.slideDirection || 'right',
        distance: this.params?.slideDistance || 50,
        fromOpacity: this.params?.fromOpacity ?? 0
      },
      duration: this.slideInDuration,
      easing: this.easing
    });

    // 第二步：缩放入场（不包含透明度变化）
    executor.execute({
      type: 'custom',
      custom: GrowIn,
      customParameters: {
        fromScale: this.params?.fromScale || 0.5,
        direction: this.params?.scaleDirection || 'xy',
        fromOpacity: 1 // 设置初始透明度为1，使第二阶段不进行透明度插值
      },
      duration: this.growInDuration,
      easing: this.easing,
      delay: this.slideInDuration // 等第一步完成后再开始
    });
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    // 动画逻辑由子动画处理
  }
}

// 移动旋转动画的参数接口
export interface IMoveRotateAnimationOptions {
  slideDirection?: 'top' | 'bottom' | 'left' | 'right';
  slideDistance?: number;
  fromAngle?: number;
  fromScale?: number;
  slideRatio?: number; // 滑动动画占总时长的比例，默认0.5
  fromOpacity?: number; // 透明度初始值，默认0
}

/**
 * 移动+旋转入场动画
 * 先走SlideIn，然后走SpinIn
 */
export class MoveRotateIn extends ACustomAnimate<any> {
  declare valid: boolean;
  private readonly slideInDuration: number;
  private readonly spinInDuration: number;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IMoveRotateAnimationOptions) {
    super(from, to, duration, easing, params);
    const slideRatio = params?.slideRatio ?? 0.5;
    this.slideInDuration = duration * slideRatio;
    this.spinInDuration = duration * (1 - slideRatio);
  }

  onBind(): void {
    super.onBind();
    // 创建AnimateExecutor来运行序列动画
    const executor = new AnimateExecutor(this.target);

    // 第一步：滑动入场（包含透明度变化）
    executor.execute({
      type: 'custom',
      custom: SlideIn,
      customParameters: {
        direction: this.params?.slideDirection || 'right',
        distance: this.params?.slideDistance || 50,
        fromOpacity: this.params?.fromOpacity ?? 0
      },
      duration: this.slideInDuration,
      easing: this.easing
    });

    // 第二步：旋转入场（不包含透明度变化）
    executor.execute({
      type: 'custom',
      custom: SpinIn,
      customParameters: {
        fromAngle: this.params?.fromAngle || Math.PI,
        fromScale: this.params?.fromScale || 0.5,
        fromOpacity: 1 // 设置初始透明度为1，使第二阶段不进行透明度插值
      },
      duration: this.spinInDuration,
      easing: this.easing,
      delay: this.slideInDuration // 等第一步完成后再开始
    });
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    // 动画逻辑由子动画处理
  }
}

/**
 * 滑动出场动画，包括从当前位置滑动到指定方向，以及透明度属性插值
 */
export class SlideOut extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;
  declare propKeys: string[];
  declare from: Record<string, number>;
  declare to: Record<string, number>;

  constructor(
    from: null,
    to: null,
    duration: number,
    easing: EasingType,
    params?: ISlideAnimationOptions & { toOpacity?: number }
  ) {
    super(from, to, duration, easing, params);
  }

  onFirstRun(): void {
    // 用于出场的时候设置属性
    const attrs = this.target.getAttributes();

    const direction = (this.params?.direction as 'top' | 'bottom' | 'left' | 'right') || 'right';
    const distance = this.params?.distance || 50;
    const fromOpacity = this.params?.fromOpacity ?? 1; // 使用透明度初始值参数
    const toOpacity = this.params?.toOpacity ?? 0; // 使用目标透明度参数

    // 初始化from和to对象
    const from: Record<string, number> = { opacity: fromOpacity, baseOpacity: fromOpacity };
    const to: Record<string, number> = { opacity: toOpacity, baseOpacity: toOpacity };

    // 根据方向设置对应的属性
    if (direction === 'top') {
      from.y = attrs.y ?? 0;
      to.y = (attrs.y ?? 0) - distance;
      this.propKeys = ['opacity', 'baseOpacity', 'y'];
    } else if (direction === 'bottom') {
      from.y = attrs.y ?? 0;
      to.y = (attrs.y ?? 0) + distance;
      this.propKeys = ['opacity', 'baseOpacity', 'y'];
    } else if (direction === 'left') {
      from.x = attrs.x ?? 0;
      to.x = (attrs.x ?? 0) - distance;
      this.propKeys = ['opacity', 'baseOpacity', 'x'];
    } else {
      // right
      from.x = attrs.x ?? 0;
      to.x = (attrs.x ?? 0) + distance;
      this.propKeys = ['opacity', 'baseOpacity', 'x'];
    }

    this.from = from;
    this.to = to;
    this.props = to;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    const attribute: Record<string, any> = this.target.attribute;
    this.propKeys.forEach(key => {
      attribute[key] = this.from[key] + (this.to[key] - this.from[key]) * ratio;
    });
    this.target.addUpdatePositionTag();
    this.target.addUpdateShapeAndBoundsTag();
  }
}

/**
 * 缩放出场动画，包括scaleX、scaleY属性从当前比例缩放到指定比例，以及透明度属性插值
 */
export class GrowOut extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;
  declare propKeys: string[];
  declare from: Record<string, number>;
  declare to: Record<string, number>;

  constructor(
    from: null,
    to: null,
    duration: number,
    easing: EasingType,
    params?: IGrowAnimationOptions & { toOpacity?: number }
  ) {
    super(from, to, duration, easing, params);
  }

  onFirstRun(): void {
    // 用于出场的时候设置属性
    const attrs = this.target.getAttributes();

    const toScale = this.params?.fromScale ?? 0; // 使用fromScale作为目标比例
    const direction = this.params?.direction || 'xy';
    const fromOpacity = this.params?.fromOpacity ?? 1; // 使用透明度初始值参数
    const toOpacity = this.params?.toOpacity ?? 0; // 使用目标透明度参数

    // 初始化from和to对象
    const from: Record<string, number> = { opacity: fromOpacity, baseOpacity: fromOpacity };
    const to: Record<string, number> = { opacity: toOpacity, baseOpacity: toOpacity };
    this.propKeys = ['opacity', 'baseOpacity'];

    // 根据方向设置对应的缩放属性
    if (direction === 'x' || direction === 'xy') {
      from.scaleX = attrs.scaleX ?? 1;
      to.scaleX = toScale;
      this.propKeys.push('scaleX');
    }

    if (direction === 'y' || direction === 'xy') {
      from.scaleY = attrs.scaleY ?? 1;
      to.scaleY = toScale;
      this.propKeys.push('scaleY');
    }

    this.from = from;
    this.to = to;
    this.props = to;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    const attribute: Record<string, any> = this.target.attribute;
    this.propKeys.forEach(key => {
      attribute[key] = this.from[key] + (this.to[key] - this.from[key]) * ratio;
    });
    this.target.addUpdatePositionTag();
    this.target.addUpdateShapeAndBoundsTag();
  }
}

/**
 * 旋转出场动画，包括rotate属性从当前角度旋转到指定角度，以及缩放属性从当前比例缩放到指定比例
 */
export class SpinOut extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;
  declare propKeys: string[];
  declare from: Record<string, number>;
  declare to: Record<string, number>;

  constructor(
    from: null,
    to: null,
    duration: number,
    easing: EasingType,
    params?: ISpinAnimationOptions & { toOpacity?: number }
  ) {
    super(from, to, duration, easing, params);
  }

  onFirstRun(): void {
    // 用于出场的时候设置属性
    const attrs = this.target.getAttributes();

    const toAngle = this.params?.fromAngle ?? Math.PI * 2; // 默认旋转一圈
    const toScale = this.params?.fromScale ?? 0;
    const fromOpacity = this.params?.fromOpacity ?? 1; // 使用透明度初始值参数
    const toOpacity = this.params?.toOpacity ?? 0; // 使用目标透明度参数

    // 初始化from和to对象
    const from: Record<string, number> = {
      opacity: fromOpacity,
      baseOpacity: fromOpacity,
      angle: attrs.angle ?? 0,
      scaleX: attrs.scaleX ?? 1,
      scaleY: attrs.scaleY ?? 1
    };

    const to: Record<string, number> = {
      opacity: toOpacity,
      baseOpacity: toOpacity,
      angle: toAngle,
      scaleX: toScale,
      scaleY: toScale
    };

    this.propKeys = ['opacity', 'baseOpacity', 'angle', 'scaleX', 'scaleY'];
    this.from = from;
    this.to = to;
    this.props = to;
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    const attribute: Record<string, any> = this.target.attribute;
    this.propKeys.forEach(key => {
      attribute[key] = this.from[key] + (this.to[key] - this.from[key]) * ratio;
    });
    this.target.addUpdatePositionTag();
    this.target.addUpdateShapeAndBoundsTag();
  }
}

/**
 * 移动+缩放出场动画
 * 先走GrowOut，然后走SlideOut
 */
export class MoveScaleOut extends ACustomAnimate<any> {
  declare valid: boolean;
  private readonly growOutDuration: number;
  private readonly slideOutDuration: number;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IMoveScaleAnimationOptions) {
    super(from, to, duration, easing, params);
    const slideRatio = params?.slideRatio ?? 0.5;
    this.growOutDuration = duration * (1 - slideRatio);
    this.slideOutDuration = duration * slideRatio;
  }

  onFirstRun(): void {
    // 创建AnimateExecutor来运行序列动画
    const executor = new AnimateExecutor(this.target);

    // 第一步：缩放出场（不包含透明度变化）
    executor.execute({
      type: 'custom',
      custom: GrowOut,
      customParameters: {
        fromScale: this.params?.fromScale || 0.5,
        direction: this.params?.scaleDirection || 'xy',
        fromOpacity: 1, // 保持透明度为1，不做变化
        toOpacity: 1 // 确保第一阶段不改变透明度
      },
      duration: this.growOutDuration,
      easing: this.easing
    });

    // 第二步：滑动出场（包含透明度变化）
    executor.execute({
      type: 'custom',
      custom: SlideOut,
      customParameters: {
        direction: this.params?.slideDirection || 'right',
        distance: this.params?.slideDistance || 50,
        fromOpacity: 1 // 起始透明度为1
      },
      duration: this.slideOutDuration,
      easing: this.easing,
      delay: this.growOutDuration // 等第一步完成后再开始
    });
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    // 动画逻辑由子动画处理
  }
}

/**
 * 移动+旋转出场动画
 * 先走SpinOut，然后走SlideOut
 */
export class MoveRotateOut extends ACustomAnimate<any> {
  declare valid: boolean;
  private readonly spinOutDuration: number;
  private readonly slideOutDuration: number;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IMoveRotateAnimationOptions) {
    super(from, to, duration, easing, params);
    const slideRatio = params?.slideRatio ?? 0.5;
    this.spinOutDuration = duration * (1 - slideRatio);
    this.slideOutDuration = duration * slideRatio;
  }

  onFirstRun(): void {
    // 创建AnimateExecutor来运行序列动画
    const executor = new AnimateExecutor(this.target);

    // 第一步：旋转出场（不包含透明度变化）
    executor.execute({
      type: 'custom',
      custom: SpinOut,
      customParameters: {
        fromAngle: this.params?.fromAngle || Math.PI,
        fromScale: this.params?.fromScale || 0.5,
        fromOpacity: 1, // 保持透明度为1，不做变化
        toOpacity: 1 // 确保第一阶段不改变透明度
      },
      duration: this.spinOutDuration,
      easing: this.easing
    });

    // 第二步：滑动出场（包含透明度变化）
    executor.execute({
      type: 'custom',
      custom: SlideOut,
      customParameters: {
        direction: this.params?.slideDirection || 'right',
        distance: this.params?.slideDistance || 50,
        fromOpacity: 1 // 起始透明度为1
      },
      duration: this.slideOutDuration,
      easing: this.easing,
      delay: this.spinOutDuration // 等第一步完成后再开始
    });
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    // 动画逻辑由子动画处理
  }
}

/**
 * 脉冲/强调动画，通过循环变化透明度、颜色和缩放来吸引注意力
 */
export class PulseAnimate extends ACustomAnimate<Record<string, any>> {
  declare valid: boolean;
  private originalAttributes: Record<string, any> = {};
  private pulseCount: number = 3; // 默认3次脉冲
  private pulseOpacity: number = 0.3;
  private pulseScale: number = 1.05;
  private pulseColor: string | null = null;
  private pulseColorIntensity: number = 0.2;
  private strokeOnly: boolean = false;
  private fillOnly: boolean = false;
  private useScale: boolean = true;
  private useOpacity: boolean = true;
  private useStroke: boolean = true;
  private useFill: boolean = true;
  private useColor: boolean = false;
  private originalFill: string | null = null;
  private originalStroke: string | null = null;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IPulseAnimationOptions) {
    super(from, to, duration, easing, params);

    // 配置脉冲参数
    if (params?.pulseCount !== undefined) {
      this.pulseCount = params.pulseCount;
    }
    if (params?.pulseScale !== undefined) {
      this.pulseScale = params.pulseScale;
    }
    if (params?.pulseColor !== undefined) {
      this.pulseColor = params.pulseColor;
    }
    if (params?.pulseColorIntensity !== undefined) {
      this.pulseColorIntensity = params.pulseColorIntensity;
    }
    if (params?.strokeOnly !== undefined) {
      this.strokeOnly = params.strokeOnly;
    }
    if (params?.fillOnly !== undefined) {
      this.fillOnly = params.fillOnly;
    }
    if (params?.useScale !== undefined) {
      this.useScale = params.useScale;
    }
    if (params?.useOpacity !== undefined) {
      this.useOpacity = params.useOpacity;
    }
    if (params?.useStroke !== undefined) {
      this.useStroke = params.useStroke;
    }
    if (params?.useFill !== undefined) {
      this.useFill = params.useFill;
    }
    if (params?.useColor !== undefined) {
      this.useColor = params.useColor;
    }
  }

  onBind(): void {
    super.onBind();
    // 保存原始属性
    this.originalAttributes = { ...this.target.getAttributes() };

    // 保存颜色相关的属性
    if (this.useColor) {
      this.originalFill = this.originalAttributes.fill || null;
      this.originalStroke = this.originalAttributes.stroke || null;

      // 如果没有指定脉冲颜色，使用元素自身的颜色
      if (!this.pulseColor) {
        if (this.fillOnly && this.originalFill) {
          this.pulseColor = this.originalFill;
        } else if (this.strokeOnly && this.originalStroke) {
          this.pulseColor = this.originalStroke;
        } else if (this.originalFill) {
          this.pulseColor = this.originalFill;
        } else if (this.originalStroke) {
          this.pulseColor = this.originalStroke;
        } else {
          this.pulseColor = '#FFFFFF'; // 默认白色
        }
      }
    }
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    // 使用ratio计算脉冲效果
    // ratio从0到1表示整个动画的进度

    // 计算脉冲值：通过将单个进度映射到多个脉冲周期
    // 将0-1的ratio映射到0到pulseCount*2*PI的角度，用于sin函数
    const angle = ratio * Math.PI * this.pulseCount;
    // 将sin值（-1到1）映射到0到1的范围
    const pulseValue = Math.abs(Math.sin(angle));

    // 应用属性
    const attribute: Record<string, any> = this.target.attribute;

    // 应用透明度 pulse
    if (this.useOpacity) {
      // 确保即使是最小值也是基于原始透明度的百分比
      const opacity = 1 + (this.pulseOpacity - 1) * pulseValue;
      if (this.useStroke) {
        attribute.strokeOpacity = (this.originalAttributes.strokeOpacity || 1) * opacity;
      }
      if (this.useFill) {
        attribute.fillOpacity = (this.originalAttributes.fillOpacity || 1) * opacity;
      }
    }

    // 应用缩放脉冲
    if (this.useScale) {
      // 计算缩放比例: 从1到pulseScale之间变化
      const scale = 1 + (this.pulseScale - 1) * pulseValue;
      attribute.scaleX = (this.originalAttributes.scaleX || 1) * scale;
      attribute.scaleY = (this.originalAttributes.scaleY || 1) * scale;
    }

    // 应用颜色脉冲
    if (this.useColor && this.pulseColor) {
      this.applyColorPulse(attribute, pulseValue);
    }

    // 确保更新渲染
    this.target.addUpdateShapeAndBoundsTag();
    this.target.addUpdatePositionTag();
  }

  // 应用颜色脉冲
  private applyColorPulse(attribute: Record<string, any>, pulseValue: number): void {
    // 根据pulseColorIntensity调整颜色变化强度
    const colorRatio = this.pulseColorIntensity * pulseValue;

    // 应用填充颜色脉冲
    if (this.useFill && this.originalFill && this.pulseColor) {
      attribute.fill = interpolateColor(this.originalFill, this.pulseColor, colorRatio, true);
    }

    // 应用描边颜色脉冲
    if (this.useStroke && this.originalStroke && this.pulseColor) {
      attribute.stroke = interpolateColor(this.originalStroke, this.pulseColor, colorRatio, true);
    }
  }

  onEnd(): void {
    super.onEnd();
    // 恢复原始属性
    this.target.setAttributes(this.originalAttributes);
  }
}
