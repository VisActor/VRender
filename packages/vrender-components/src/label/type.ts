import type { EasingType, IGroupGraphicAttribute, ITextGraphicAttribute } from '@visactor/vrender';
import type { Bounds } from '@visactor/vutils';

export type LabelItemStateStyle<T> = {
  hover?: T;
  hover_reverse?: T;
  selected?: T;
  selected_reverse?: T;
};

export interface BaseLabelAttrs extends IGroupGraphicAttribute {
  type: string;
  /**
   * 是否开启选中交互
   * @default false
   */
  select?: boolean;
  /**
   * 是否开启 hover 交互
   * @default false
   */
  hover?: boolean;
  /**
   * 标签数据
   */
  data: Functional<(ITextGraphicAttribute & Record<string, any>)[]>;

  sort?: (graphicA: any, graphicB: any) => number;

  /**
   *  图元 group 名称
   *  如果不配置，需要在 data 里指定标签定位 x/y
   */
  baseMarkGroupName?: string;

  /** 文本样式，优先级低于 data */
  textStyle?: Partial<ITextGraphicAttribute>;

  /** 文本交互样式 */
  state?: LabelItemStateStyle<ITextGraphicAttribute>;

  /** 标签默认位置 */
  position?: Functional<string>;

  /** 偏移量 */
  offset?: number;

  /** 是否开启防重叠
   * @default true
   */
  overlap?: OverlapAttrs | false;

  /** 智能反色 */
  smartInvert?: SmartInvertAttrs | false;

  /** 动画配置 */
  animation?: ILabelAnimation | false;
}

export interface OverlapAttrs {
  /**
   * 防重叠的区域大小
   */
  size?: { width: number; height: number };

  /**
   * 发生重叠后，是否隐藏标签
   * @default true
   */
  hideOnHit?: boolean;

  /**
   * 是否约束标签在指定 size 的范围内。开启后若标签被区域裁剪，会向内收缩。
   * @default true
   */
  clampForce?: boolean;

  /**
   * 是否躲避基础图元
   * @default false
   */
  avoidBaseMark?: boolean;

  /**
   * 发生重叠后的躲避策略
   */
  strategy?: Strategy[];
}

export interface SmartInvertAttrs {
  /**
   * 文本类型
   * 包含普通文本和大文本，对应不同的对比度标准，label默认为普通文本
   * 'normalText' ｜ 'largeText'
   * @default 'normalText'
   */
  textType?: string;
  /**
   * 自定义对比度阈值
   */
  contrastRatiosThreshold?: number;
  /**
   * 自定义备选label颜色
   */
  alternativeColors?: string | string[];
}

export type PositionStrategy = {
  /**
   * 可选位置策略。
   * 若默认位置没有足够的空间放置标签，则考虑 position 内的备选位置。
   */
  type: 'position';
  position?: Functional<LabelPosition[]>;
};

export type BoundStrategy = {
  /**
   * 标签配置在图形内部时使用。
   * 当图形大小不足以放下标签，则考虑 position 内的备选位置。
   */
  type: 'bound';
  position?: Functional<LabelPosition[]>;
};

export type MoveYStrategy = {
  /**
   * 可选位置策略。
   * 若默认位置没有足够的空间放置标签，则根据 offset 在Y方向上寻找位置。
   */
  type: 'moveY';
  /**
   * Y方向上的尝试的位置偏移量
   */
  offset: Functional<number[]>;
};

export type MoveXStrategy = {
  /**
   * 可选位置策略。
   * 若默认位置没有足够的空间放置标签，则根据 offset 在X方向上寻找位置。
   */
  type: 'moveX';
  /**
   * X方向上的尝试的位置偏移量
   */
  offset: Functional<number[]>;
};

export type Strategy = PositionStrategy | BoundStrategy | MoveYStrategy | MoveXStrategy;

export type LabelPosition = SymbolLabelAttrs['position'] | RectLabelAttrs['position'];

export interface SymbolLabelAttrs extends BaseLabelAttrs {
  type: 'symbol';

  /**
   * 标签位置
   * @default 'top'
   */
  position?: Functional<
    'top' | 'bottom' | 'left' | 'right' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center'
  >;
}

export interface RectLabelAttrs extends BaseLabelAttrs {
  type: 'rect';

  /**
   *  图元 group 名称
   */
  baseMarkGroupName: string;

  /**
   * 标签位置
   * @default 'top'
   */
  position?: Functional<
    'top' | 'bottom' | 'left' | 'right' | 'inside' | 'inside-top' | 'inside-bottom' | 'inside-right' | 'inside-left'
  >;
}

export interface LineLabelAttrs extends BaseLabelAttrs {
  type: 'line';

  /**
   *  图元 group 名称
   */
  baseMarkGroupName: string;

  /**
   * 标签位置
   * @default 'end'
   */
  position?: Functional<'start' | 'end'>;
}

export interface ArcLabelAttrs extends BaseLabelAttrs {
  type: 'arc';

  /**
   *  图元 group 名称
   */
  baseMarkGroupName: string;

  /**
   * 标签位置
   * @default 'outside'
   */
  position?: Functional<'inside' | 'outside'>;

  // 画布宽度
  width?: number;
  // 画布高度
  height?: number;
}

export interface DataLabelAttrs extends IGroupGraphicAttribute {
  dataLabels: (RectLabelAttrs | SymbolLabelAttrs)[];
  /**
   * 防重叠的区域大小
   */
  size: { width: number; height: number };
}

export type Functional<T> = T | ((data: any) => T);

export interface ILabelGraphicAttribute extends ITextGraphicAttribute {
  angle: any;
  textBaseline: string;
  fill: any;
  line: any;
  pointC: IPoint;
  pointB: IPoint;
  pointA: IPoint;
  stroke: any;
  visible: boolean;
  textAlign: string;
  _relatedIndex?: number;
}

export interface ILabelAnimation {
  mode?: 'same-time' | 'after' | 'after-all';
  duration?: number;
  delay?: number;
  easing?: EasingType;
  /** 是否开启 increaseCount 动画
   * @default true
   */
  increaseEffect?: boolean;
}

export interface IPoint {
  x: number;
  y: number;
}

export interface IPolarPoint {
  radius: number;
  angle: number;
}

export type Quadrant = 1 | 2 | 3 | 4;

export type TextAlign = 'left' | 'right' | 'center';
