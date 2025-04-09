import { FadeIn } from './fade';
import type { EasingType } from '../intreface/easing';
import { ACustomAnimate } from './custom-animate';
import { AnimateExecutor } from '../executor/animate-executor';

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
