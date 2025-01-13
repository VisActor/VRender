import type {
  EasingType,
  IArcGraphicAttribute,
  IGroup,
  IGroupGraphicAttribute,
  IImageGraphicAttribute,
  ILineGraphicAttribute,
  IPolygonAttribute,
  IPolygonGraphicAttribute,
  IRectGraphicAttribute,
  IRichTextGraphicAttribute,
  ISymbol,
  ISymbolGraphicAttribute,
  ITextGraphicAttribute
} from '@visactor/vrender-core';
import type { CommonSegmentAttributes, ILineGraphicWithCornerRadius, SegmentAttributes } from '../segment/type';
import type { TagAttributes } from '../tag/type';
import type { Point, State } from '../core/type';

export enum IMarkLineLabelPosition {
  start = 'start',
  startTop = 'startTop',
  startBottom = 'startBottom',
  insideStart = 'insideStart',
  insideStartTop = 'insideStartTop',
  insideStartBottom = 'insideStartBottom',

  middle = 'middle',
  insideMiddleTop = 'insideMiddleTop',
  insideMiddleBottom = 'insideMiddleBottom',

  end = 'end',
  endTop = 'endTop',
  endBottom = 'endBottom',
  insideEnd = 'insideEnd',
  insideEndTop = 'insideEndTop',
  insideEndBottom = 'insideEndBottom'
}

export enum IMarkAreaLabelPosition {
  left = 'left',
  right = 'right',
  top = 'top',
  bottom = 'bottom',
  topLeft = 'topLeft',
  topRight = 'topRight',
  bottomLeft = 'bottomLeft',
  bottomRight = 'bottomRight',

  middle = 'middle',

  insideLeft = 'insideLeft',
  insideRight = 'insideRight',
  insideTop = 'insideTop',
  insideBottom = 'insideBottom',
  insideTopLeft = 'insideTopLeft',
  insideTopRight = 'insideTopRight',
  insideBottomLeft = 'insideBottomLeft',
  insideBottomRight = 'insideBottomRight'
}

export enum IMarkCommonArcLabelPosition {
  arcInnerStart = 'arcInnerStart',
  arcInnerEnd = 'arcInnerEnd',
  arcInnerMiddle = 'arcInnerMiddle',
  arcOuterStart = 'arcOuterStart',
  arcOuterEnd = 'arcOuterEnd',
  arcOuterMiddle = 'arcOuterMiddle',
  center = 'center'
}

export enum IMarkPointItemPosition {
  top = 'top',
  bottom = 'bottom',
  middle = 'middle',
  insideTop = 'insideTop',
  insideBottom = 'insideBottom',
  insideMiddle = 'insideMiddle'
}

export type IMarkBackgroundAttributes = {
  /**
   * 是否绘制背景层
   */
  visible: boolean;
  /**
   * TODO: 根据文字宽度进行背景 panel size自适应
   */
  autoHeight?: boolean;
  /**
   * TODO: 根据文高度度进行背景 panel size自适应
   */
  autoWidth?: boolean;
} & Partial<IRectGraphicAttribute>;

export type IMarkLabel = Omit<TagAttributes, 'x' | 'y' | 'panel'> & {
  /**
   * 标签的背景面板配置
   */
  panel?: IMarkBackgroundAttributes;
};

export type IMarkRef = {
  /**
   * 自动旋转，沿着线的方向
   * @default
   * mark-line/mark-area/mark-point: false - 旧逻辑里autoRotate是false, 保持不变
   * mark-arc-line/mark-arc-area: true - 新增逻辑, 如果不开启的话, 效果不太好, 所以默认true
   * mark-point - 旧逻辑里autoRotate是true, 保持不变
   */
  autoRotate?: boolean;
  /**
   * label 相对line平行方向上的偏移
   */
  refX?: number;
  /**
   * label 相对line正交方向上的偏移
   */
  refY?: number;
  /**
   * label 相对默认角度的偏移 （label跟随line的角度做自动旋转时，默认按照line的平行向量作为初始角度）
   */
  refAngle?: number;
};

export type MarkerAttrs<AnimationType> = IGroupGraphicAttribute & {
  /**
   * 设置标注的类型
   */
  type?: 'line' | 'arc-line' | 'area' | 'arc-area' | 'point';
  /**
   * 是否支持交互
   * @default true
   */
  interactive?: boolean;
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
   * 是否显示marker组件
   * @default true
   */
  visible?: boolean;
  /**
   * 是否将组件在绘制区域内进行剪切
   * @default true
   */
  clipInRange?: boolean;
  /**
   * 组件绘制范围配置
   */
  limitRect?: {
    /**
     * 绘制范围的起点x坐标
     */
    x: number;
    /**
     * 绘制范围的起点y坐标
     */
    y: number;
    /**
     * 绘制范围的宽度
     */
    width: number;
    /**
     * 绘制范围的高度
     */
    height: number;
  };
} & BaseMarkerAnimation<AnimationType>;

/** animation type */
export type BaseMarkerAnimation<T> = {
  /**
   * 动画公共配置
   */
  animation?: MarkerAnimation<T> | boolean;
  /**
   * 入场动画配置
   */
  animationEnter?: MarkerUpdateAnimation<T>;
  /**
   * 更新动画配置
   */
  animationUpdate?: MarkerUpdateAnimation<T>;
  /**
   * 离场动画配置
   */
  animationExit?: MarkerExitAnimation;
};
export type MarkerAnimation<T> = MarkerUpdateAnimation<T> | MarkerUpdateAnimation<T>;

export type MarkerUpdateAnimation<T> = {
  /**
   * 设置动画的类型
   */
  type: T;
} & MarkerExitAnimation;

export type MarkCommonLineAnimationType = 'clipIn' | 'fadeIn';

export type CommonMarkAreaAnimationType = 'fadeIn';

export type MarkPointAnimationType = 'callIn' | 'fadeIn';

export type MarkerExitAnimation = {
  /**
   * 设置离场动画的类型为fadeOut，即淡出
   */
  type: 'fadeOut';
  /**
   * 动画的时长
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
};

export type MarkerAnimationState = 'enter' | 'update' | 'exit';

/** state type */
export type MarkCommonLineState<LineAttr> = {
  /**
   * 设置线图形的在特定状态下的样式
   */
  line?: State<LineAttr>;
  /**
   * 设置线的起点在特定状态下的样式
   */
  lineStartSymbol?: State<Partial<ISymbolGraphicAttribute>>;
  /**
   * 设置线的终点在特定状态下的样式
   */
  lineEndSymbol?: State<Partial<ISymbolGraphicAttribute>>;
  /**
   * 设置标签在特定状态下的样式
   */
  label?: State<Partial<ITextGraphicAttribute>>;
  /**
   * 设置标签背景区块在特定状态下的样式
   */
  labelBackground?: State<Partial<IRectGraphicAttribute>>;
};

export type CommonMarkAreaState<AreaAttr> = {
  /**
   * 设置标注区域在特定状态下的样式
   */
  area?: State<Partial<AreaAttr>>;
  /**
   * 设置标注区域标签在特定状态下的样式
   */
  label?: State<Partial<ITextGraphicAttribute>>;
  /**
   * 设置标签背景区块在特定状态下的样式
   */
  labelBackground?: State<Partial<IRectGraphicAttribute>>;
};

export type MarkPointState = {
  /**
   * 设置标注点连线在特定状态下的样式
   */
  line?: State<ILineGraphicWithCornerRadius | Partial<ILineGraphicAttribute>[]>;
  /**
   * 设置线起点图形在特定状态下的样式
   */
  lineStartSymbol?: State<Partial<ISymbolGraphicAttribute>>;
  /**
   * 设置线终点图形在特定状态下的样式
   */
  lineEndSymbol?: State<Partial<ISymbolGraphicAttribute>>;
  /**
   * 设置标注图形在特定状态下的样式
   */
  symbol?: State<Partial<ISymbolGraphicAttribute>>;
  /**
   * 设置标注图形在特定状态下的样式
   */
  image?: State<Partial<IImageGraphicAttribute>>;
  /**
   * 设置标签在特定状态下的样式
   */
  text?: State<Partial<ITextGraphicAttribute>>;
  /**
   * 设置标签背景区块在特定状态下的样式
   */
  textBackground?: State<Partial<IRectGraphicAttribute>>;
  /**
   * 设置富文本在特定状态下的样式
   */
  richText?: State<Partial<IRichTextGraphicAttribute>>;
  /**
   * 设置自定义标注图形在特定状态下的样式
   */
  customMark?: State<Partial<IGroupGraphicAttribute>>;
  /**
   * 设置目标元素在特定状态下的样式
   */
  targetItem?: State<Partial<ISymbolGraphicAttribute>>;
};

export type MarkCommonLineAttrs<LineAttr, LineLabelPosition, MarkCommonLineAnimationType> =
  MarkerAttrs<MarkCommonLineAnimationType> &
    Omit<CommonSegmentAttributes, 'state' | 'lineStyle'> & {
      /**
       * 标签
       */
      label?: {
        /**
         * label 相对line的位置
         */
        position?: LineLabelPosition;
        /**
         * 当 mark 配置了 limitRect 之后，label 是否自动调整位置
         * @default false
         */
        confine?: boolean;
      } & IMarkRef &
        IMarkLabel;
      /**
       * 辅助线各种状态下的样式
       */
      state?: MarkCommonLineState<LineAttr>;
    };

export type MarkLineAttrs = MarkCommonLineAttrs<
  ILineGraphicWithCornerRadius | ILineGraphicAttribute[],
  keyof typeof IMarkLineLabelPosition,
  MarkCommonLineAnimationType
> & {
  /**
   * 将辅助线的类型设置为 'line'
   */
  type?: 'line';
  /**
   * 是否对 points 进行多段处理，默认为 false，即直接将所有的点连接成线。
   * 如果需要进行多段处理，需要将 points 属性配置为 Point[][] 类型
   * @default false
   */
  multiSegment?: boolean;
  /**
   * 在 `multiSegment` 属性开启的前提下，用于声明那一段线段用来作为主线段，如果不声明，默认全段为主线段
   */
  mainSegmentIndex?: number;
  /**
   * 构成line的点: 如果是两个点，则为直线；多个点则为折线
   */
  points: Point[] | Point[][];
  /**
   * 线的样式设置
   */
  lineStyle?: ILineGraphicAttribute;
};

export type MarkArcLineAttrs = MarkCommonLineAttrs<
  IArcGraphicAttribute,
  keyof typeof IMarkCommonArcLabelPosition,
  MarkCommonLineAnimationType
> & {
  /**
   * 将辅助线的类型设置为 'arc-line'，即弧线
   */
  type?: 'arc-line';
  /**
   * 弧线中心位置
   */
  center: {
    x: number;
    y: number;
  };
  /**
   * 弧线半径
   */
  radius: number;
  /**
   * 弧线起始角度（弧度）
   */
  startAngle: number;
  /**
   * 弧线终点角度（弧度）
   */
  endAngle: number;
  /**
   * 设置弧线的样式
   */
  lineStyle?: IArcGraphicAttribute;
};

export type MarkAreaAttrs = MarkerAttrs<CommonMarkAreaAnimationType> & {
  type?: 'area';
  /**
   * 构成area的点
   */
  points: Point[];
  /**
   * 标签
   */
  label?: {
    /**
     * 设置标签的位置
     */
    position?: keyof typeof IMarkAreaLabelPosition;
    /**
     * 当 mark 配置了 limitRect 之后，label 是否自动调整位置
     * @default false
     */
    confine?: boolean;
  } & IMarkLabel;
  /**
   * area的样式
   */
  areaStyle?: IPolygonAttribute;
  /**
   * 设置标注区域在各种状态下的样式
   */
  state?: CommonMarkAreaState<IPolygonGraphicAttribute>;
};

export type MarkArcAreaAttrs = MarkerAttrs<CommonMarkAreaAnimationType> & {
  type?: 'arc-area';
  /**
   * 扇区中心位置
   */
  center: {
    x: number;
    y: number;
  };
  /**
   * 扇区内半径
   */
  innerRadius: number;
  /**
   * 扇区外半径
   */
  outerRadius: number;
  /**
   * 扇区起始角度（弧度）
   */
  startAngle: number;
  /**
   * 扇区终点角度（弧度）
   */
  endAngle: number;
  /**
   * 标签
   */
  label?: {
    /**
     * 标签的位置
     */
    position?: keyof typeof IMarkCommonArcLabelPosition;
    /**
     * 当 mark 配置了 limitRect 之后，label 是否自动调整位置
     * @default false
     */
    confine?: boolean;
  } & IMarkRef &
    IMarkLabel;
  /**
   * area的样式
   */
  areaStyle?: IArcGraphicAttribute;
  /**
   * 辅助区域这种状态下各个图元的样式设置
   */
  state?: CommonMarkAreaState<IArcGraphicAttribute>;
};

export type IItemContent = IMarkRef & {
  /**
   * 标注类型
   * Tips: 保留'richText'与之前的定义做兼容
   */
  type?: 'symbol' | 'text' | 'image' | 'richText' | 'custom';
  /**
   * 设置标注的位置
   */
  position?: keyof typeof IMarkPointItemPosition;
  /**
   * x 方向偏移量
   */
  offsetX?: number;
  /**
   * y 方向偏移量
   */
  offsetY?: number;
  /**
   * type为symbol时, symbol的样式
   */
  symbolStyle?: ISymbolGraphicAttribute;
  /**
   * type为image时, image的样式
   */
  imageStyle?: IImageGraphicAttribute;
  /**
   * type为text时, text的配置
   * 'text'类型的ItemContent新增三种子类型：'text','rich','html'。配置在textStyle.type上，继承自TagAttributes。
   */
  textStyle?: IMarkLabel;
  /**
   * type为rich text时, rich text的样式
   */
  richTextStyle?: IRichTextGraphicAttribute;
  /**
   * type为custom时，允许以callback的方式传入需要render的item
   */
  renderCustomCallback?: () => IGroup;
  /**
   * 当 mark 配置了 limitRect 之后，label 是否自动调整位置
   * @default false
   */
  confine?: boolean;
};

export type IItemLine = {
  /** TODO：'type-opo' */
  type?: 'type-s' | 'type-do' | 'type-po' | 'type-op' | 'type-arc';
  /**
   * 是否展示该标注
   */
  visible?: boolean;
  /**
   * 当type为type-arc时生效, 数值决定曲率, 符号决定法向, 不能等于0
   * @default 0.8
   */
  arcRatio?: number;
  /**
   * 垂直于引导线的装饰线，参考案例: https://observablehq.com/@mikelotis/edmonton-population-history-line-chart
   */
  decorativeLine?: {
    /**
     * 是否显示引导线的装饰线
     */
    visible?: boolean;
    /**
     * 装饰线的长度
     */
    length?: number;
  };
} & Omit<SegmentAttributes, 'points'>;

export type MarkPointAttrs = Omit<MarkerAttrs<MarkPointAnimationType>, 'labelStyle'> & {
  /**
   * markPoint的位置（也是path的起点）
   */
  position: Point;
  /**
   * 标注引导线
   */
  itemLine?: IItemLine;

  /**
   * 标注内容
   */
  itemContent?: IItemContent;

  /**
   * 被标注的内容
   */
  targetSymbol?: {
    /**
     * 被标注内容与标记线间的间隙
     * @default 0
     */
    offset?: number;
    /**
     * 是否显示
     * @default false
     */
    visible?: boolean;
    /**
     * 大小
     * @default 20
     */
    size?: number;
    /**
     * 被标注内容的样式设置
     */
    style?: ISymbol;
  };
  /**
   * 标注点各个状态下的样式
   */
  state?: MarkPointState;
} & BaseMarkerAnimation<MarkPointAnimationType>;
