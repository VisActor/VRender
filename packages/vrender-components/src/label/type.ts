import type {
  EasingType,
  IGraphic,
  IGroupGraphicAttribute,
  ITextGraphicAttribute,
  IRichTextGraphicAttribute,
  IText,
  TextAlignType,
  TextBaselineType,
  ILineGraphicAttribute,
  IRichTextCharacter,
  IRichText,
  ILine,
  ICustomPath2D,
  IArc,
  IGroup
} from '@visactor/vrender-core';
import type { BoundsAnchorType, IPointLike, InsideBoundsAnchorType } from '@visactor/vutils';

export type LabelItemStateStyle<T> = {
  hover?: T;
  hover_reverse?: T;
  selected?: T;
  selected_reverse?: T;
  [key: string]: T;
};

export type LabelItem = {
  // 用于动画
  id?: string;
  // 原始数据
  data?: any;
  [key: string]: any;
  // 文本类型：text, rich, html (区分于图元类型)
  textType?: string;
  /**
   * 文本内容，如果需要进行换行，则使用数组形式，如 ['abc', '123']
   * 支持富文本内容, 如textConfig, html
   */
  text?: string | string[] | number | number[] | IRichTextCharacter[];
  /**
   * 兼容ITextGraphicAttribute与IRichTextGraphicAttribute的textAlign属性
   */
  textAlign?: 'left' | 'right' | 'center' | 'start' | 'end';
  textBaseline?: 'top' | 'middle' | 'bottom' | 'alphabetic';
} & (
  | Omit<Partial<ITextGraphicAttribute>, 'textAlign' | 'textBaseline'>
  | Omit<Partial<IRichTextGraphicAttribute>, 'textAlign' | 'textBaseline'>
);

export interface BaseLabelAttrs extends IGroupGraphicAttribute {
  type: string;
  /**
   *  图元 group 名称
   */
  baseMarkGroupName: string;
  /**
   * @hack not recommend to use
   * @returns
   */
  getBaseMarks?: () => IGraphic[];
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
  data: LabelItem[];

  /** 文本样式，优先级低于 data */
  textStyle?: Partial<ITextGraphicAttribute>;

  /** 文本交互样式 */
  state?: LabelItemStateStyle<ITextGraphicAttribute>;

  /** 连接线样式 */
  line?: ILabelLineSpec;

  /** 连线的交互样式 */
  labelLineState?: LabelItemStateStyle<ILineGraphicAttribute>;

  syncState?: boolean;

  /** 标签默认位置 */
  position?: Functional<string>;

  /** 偏移量 */
  offset?: number;

  /** 是否开启防重叠
   * @default true
   */
  overlap?: OverlapAttrs | boolean;

  /** 智能反色 */
  smartInvert?: SmartInvertAttrs | boolean;

  /** 动画配置 */
  animation?: ILabelAnimation | boolean;
  /**
   * 新增标签动画
   */
  animationEnter?: ILabelUpdateAnimation | boolean;
  /**
   * 标签更新动画
   */
  animationUpdate?: ILabelUpdateAnimation | ILabelUpdateChannelAnimation[] | boolean;
  /**
   * 标签被删除的动画配置
   */
  animationExit?: ILabelExitAnimation | boolean;

  /**
   * 数据过滤自定义函数，可以用于 排序 or 删减
   */
  dataFilter?: (data: LabelItem[]) => LabelItem[];

  /** 自定义布局函数
   * @description 当配置了 customLayoutFunc 后，默认布局逻辑将不再生效。（position/offset不生效）
   */
  customLayoutFunc?: (
    item: LabelItem[],
    labels: (IText | IRichText)[],
    getRelatedGraphic: (data: LabelItem) => IGraphic,
    getRelatedPoint?: (data: LabelItem) => IPointLike
  ) => (IText | IRichText)[];

  /** 自定义标签躲避函数
   * @description 当配置了 customOverlapFunc 后，会根据 position 和 offset 进行初始布局。配置的防重叠逻辑(overlap)不生效。
   */
  customOverlapFunc?: (
    label: (IText | IRichText)[],
    getRelatedGraphic: (data: LabelItem) => IGraphic,
    getRelatedPoint?: (data: LabelItem) => IPointLike
  ) => (IText | IRichText)[];
  /**
   * 防重叠计算完成后的回调函数
   * @since 1.19.16
   */
  onAfterOverlapping?: (
    labels: (IText | IRichText)[],
    getRelatedGraphic: (data: LabelItem) => IGraphic,
    getRelatedPoint?: (data: LabelItem) => IPointLike
  ) => void;
  /**
   * 关闭交互效果
   * @default false
   */
  disableTriggerEvent?: boolean;
  /** 唯一标志符 */
  id?: string;
}

export interface OverlapAttrs {
  /**
   * 防重叠的区域大小
   */
  size?: {
    /**
     * 防重叠区域的宽度
     */
    width: number;
    /**
     * 防重叠区域的高度
     */
    height: number;
  };

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
   * 躲避指定图元
   * @default []
   */
  avoidMarks?: string[] | IGraphic[];

  /**
   * 发生重叠后的躲避策略
   * @since 0.20.10 支持全局 Y 方向偏移策略 'shiftY'。当标签发生重叠时，会保相对位置并在 Y 方向上散开。由于 'shiftY' 是全局布局策略，不与其他策略同时生效。
   */
  strategy?: Strategy[] | ShiftYStrategy;

  /**
   * 文字在防重叠计算中预留的边距。
   * @default 0
   */
  overlapPadding?: number;

  /**
   * 防重叠的顺序权重
   * @since 0.20.10
   * @param labelItem
   * @returns number 数值越大，权重越高。权重越高的标签越优先被布局。
   */
  priority?: (labelItem: LabelItem) => number;
}

export interface SmartInvertAttrs {
  /**
   * 对比度度量
   * 'WCAG' | 'lightness'
   * 默认使用'WCAG'
   */
  mode?: string;
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
  /**
   * fillStrategy四种策略：
   * - base（baseMark色），
   * - invertBase（执行智能反色），
   * - similarBase（智能反色的补色），
   * - null（不执行智能反色，保持fill设置的颜色）
   * @default 'invertBase'
   */
  fillStrategy?: 'base' | 'invertBase' | 'similarBase' | 'null';
  /**
   * strokeStrategy的四种策略:
   * - base（baseMark色），
   * - invertBase（执行智能反色），
   * - similarBase（智能反色的补色），
   * - null（不执行智能反色，保持stroke设置的颜色）
   * @default 'base'
   */
  strokeStrategy?: 'base' | 'invertBase' | 'similarBase' | 'null';
  /**
   * 前景色与亮色具有对比度时，similarSeries使用该色
   * @default '#ffffff'
   */
  brightColor?: string;
  /**
   * 前景色与暗色具有对比度时，similarSeries使用该色
   * @default '#000000'
   */
  darkColor?: string;
  /**
   * label超出mark范围，也以mark作为背景色进行反色
   */
  outsideEnable?: boolean;
  /**
   * 当标签和mark相交，但是没有完全在mark内部的时候，支持三种处理方式：
   *
   * * none：不做任何处理
   * * stroked：标签存在描边的时候，根据描边进行处理
   * * inside: 和标签完全在mark内部一样处理
   */
  interactInvertType?: 'none' | 'stroked' | 'inside';
}

export type ShiftYStrategy = {
  /**
   * 将防重叠策略设置为 'shiftY'
   */
  type: 'shiftY';
  /**
   * 布局迭代次数
   * @default 10
   */
  iteration?: number;
  /**
   * 布局容差
   * @default 0.1
   */
  maxError?: number;
  /**
   * 散开后的间距
   * @default 1
   */
  padding?: number;
};

export type PositionStrategy = {
  /**
   * 将防重叠的策略设置为'position'，即可选位置策略。
   * 若默认位置没有足够的空间放置标签，则考虑 position 内的备选位置。
   */
  type: 'position';
  /**
   * 所有的备选位置
   */
  position?: Functional<LabelPosition[]>;
  /**
   * 当 position 内的备选位置依然无法放下标签时，标签是否放回原位。
   * 默认为 true，若为 false，则标签会被放在 position 数组的最后一个位置。
   * @since 0.20.18
   * @default true
   */
  restorePosition?: boolean;
};

export type BoundStrategy = {
  /**
   * 将防重叠策略设置为'bound'，当标签配置在图形内部时使用。
   * 当图形大小不足以放下标签，则考虑 position 内的备选位置。
   */
  type: 'bound';
  /**
   * 所有的备选位置
   */
  position?: Functional<LabelPosition[]>;
  /**
   * 当 position 内的备选位置依然无法放下标签时，标签是否放回原位。
   * 默认为 true，若为 false，则标签会被放在 position 数组的最后一个位置。
   * @since 0.20.18
   * @default true
   */
  restorePosition?: boolean;
};

export type MoveYStrategy = {
  /**
   * 将防重叠策略设置为'moveY'
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
   * 将防重叠策略设置为'moveX'
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
  position?: Functional<BoundsAnchorType>;
}

export interface RectLabelAttrs extends BaseLabelAttrs {
  type: 'rect';
  /**
   * 标签位置
   * @default 'top'
   */
  position?: Functional<InsideBoundsAnchorType | BoundsAnchorType>;
}

export interface LineLabelAttrs extends BaseLabelAttrs {
  type: 'line';
  /**
   * 标签位置
   * @default 'end'
   */
  position?: Functional<'start' | 'end'>;
}

export interface AreaLabelAttrs extends BaseLabelAttrs {
  type: 'area';
  /**
   * 标签位置
   * @default 'end'
   */
  position?: Functional<'start' | 'end'>;
}

export interface LineDataLabelAttrs extends BaseLabelAttrs {
  type: 'line-data';

  /**
   * 标签位置
   * @default 'top'
   * @since 0.21.1 支持 'inside-middle' 在面积图元中显示在中间位置
   */
  position?: Functional<BoundsAnchorType | 'inside-middle'>;
}

export interface PolygonLabelAttrs extends BaseLabelAttrs {
  type: 'polygon';
  /**
   * 标签位置
   * @default 'center'
   */
  position?: Functional<'center'>;
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
   * @since 0.20.1 support 'inside-center'
   */
  position?: 'inside' | 'outside' | 'inside-inner' | 'inside-outer' | 'inside-center';

  // 画布宽度
  width?: number;
  // 画布高度
  height?: number;

  /**
   * 是否允许标签重叠
   * @default false
   */
  coverEnable?: boolean;
  /**
   * 是否允许标签旋转
   * @default true
   */
  rotate?: boolean;

  /**
   * 文字与引导线间隔宽度
   * @default 5
   */
  spaceWidth?: number;
  /**
   * 标签旋转角度
   */
  angle?: number;
  /**
   * 标签旋转角度的偏移角度
   */
  offsetAngle?: number;
  /**
   * 标签相对于 `outerRadius` 的径向偏移，目前仅作用于 inside 标签
   */
  offsetRadius?: number;
  /**
   * 标签横向点对齐
   */
  textAlign?: TextAlignType;
  /**
   * 标签纵向点对齐
   */
  textBaseline?: TextBaselineType;
  /**
   * 扇区间标签的间隔
   * @default 6
   */
  layoutArcGap?: number;
  /** 标签引导线样式 */
  line?: IArcLabelLineSpec;
  /** 标签布局配置 */
  layout?: IArcLabelLayoutSpec;
  /** 标签引导线点集 */
  points?: IPoint[];
  /** 饼图扇区中心偏移 */
  centerOffset?: number;
}

export interface ILabelLineSpec {
  /**
   * 是否显示引导线
   * @default true
   */
  visible?: boolean;
  /**
   * 自定义路径
   * @since 0.19.21
   */
  customShape?: (container: IGroup, attrs: Partial<ILineGraphicAttribute>, path: ICustomPath2D) => ICustomPath2D;
  /**
   * 引导线样式
   */
  style?: Partial<ILineGraphicAttribute>;
}

export interface IArcLabelLineSpec extends ILabelLineSpec {
  /**
   * 引导线 line1 部分最小长度
   * @default 20
   */
  line1MinLength?: number;
  /**
   * 引导线 line2 部分最小长度
   * @default 10
   * @since 0.20.3 支持函数回调
   */
  line2MinLength?: number | ((texts: IGraphic[], arcs: IArc[], attrs: Partial<ArcLabelAttrs>) => number);
  /**
   * 引导线是否光滑
   * @default false
   */
  smooth?: boolean;
}

export type ArcLabelAlignType = 'arc' | 'labelLine' | 'edge';

export type ArcLabelStrategyType = 'priority' | 'vertical' | 'none';

export interface IArcLabelLayoutSpec {
  /**
   * 标签对齐方式
   * @default 'arc'
   */
  textAlign?: ArcLabelAlignType;
  /** @deprecate 建议统一使用textAlign，后续将废除 */
  align?: ArcLabelAlignType;
  /**
   * 标签对齐的偏移量
   * @since 0.20.3
   */
  alignOffset?: number | ((texts: IGraphic[], arcs: IArc[], attrs: Partial<ArcLabelAttrs>) => number);
  /**
   * 标签布局策略
   * @default 'priority'
   */
  strategy?: ArcLabelStrategyType;
  /**
   * 是否启用切线约束
   * @default true
   */
  tangentConstraint?: boolean;
}

export interface DataLabelAttrs extends IGroupGraphicAttribute {
  dataLabels: (RectLabelAttrs | SymbolLabelAttrs | ArcLabelAttrs | LineDataLabelAttrs)[];
  /**
   * 防重叠的区域大小
   */
  size: { width: number; height: number; padding?: { top?: number; left?: number; right?: number; bottom?: number } };
}

export type Functional<T> = T | ((data: any) => T);

/**
 * 标签的离场动画配置
 */
export interface ILabelExitAnimation {
  /**
   * 动画执行的时长
   */
  duration?: number;
  /**
   * 动画延迟的时长
   */
  delay?: number;
  /**
   * 动画的缓动函数
   */
  easing?: EasingType;
}

/**
 * 标签的入场动画配置
 */
export interface ILabelEnterAnimation extends ILabelExitAnimation {
  /**
   * 标签动画的模式，支持三种类型
   * - same-time：标签出现动画和关联图形的动画同时进行
   * - after：当关联动图的出场动画结束后，执行标签的出场动画
   * - after-all：当所有关联图元的出场动画结束后，执行标签的出场动画
   */
  mode?: 'same-time' | 'after' | 'after-all';
}

/**
 * 标签的更新动画配置
 */
export interface ILabelUpdateAnimation extends ILabelExitAnimation {
  /**
   * 是否开启 increaseCount 动画
   * @default true
   */
  increaseEffect?: boolean;
}

/**
 * 标签更新的时候，动画的通道配置
 */
export interface ILabelUpdateChannelAnimation extends ILabelUpdateAnimation {
  /**
   * 进行插值动画的视觉通道
   */
  channel?: string[];
  /**
   * 动画的配置
   */
  options?: {
    /**
     * 忽略的视觉通道
     */
    excludeChannels?: string[];
  };
}

export interface ILabelAnimation extends ILabelEnterAnimation, ILabelExitAnimation, ILabelUpdateAnimation {}

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

export type LabelContent = {
  text: IText | IRichText;
  labelLine?: ILine;
};
