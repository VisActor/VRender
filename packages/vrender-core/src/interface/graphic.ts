import type { IAABBBounds, IMatrix, IPointLike, IPoint, BoundsAnchorType, IOBBBounds } from '@visactor/vutils';
import type { IAnimate, IStep, EasingType, IAnimateTarget } from './animate';
import type { IColor } from './color';
import type { IGroup } from './graphic/group';
import type { IShadowRoot } from './graphic/shadow-root';
import type { ILayer } from './layer';
import type { INode } from './node-tree';
import type { ICustomPath2D } from './path';
import type { IStage } from './stage';
import type { IGlyphGraphicAttribute } from './graphic/glyph';
import type { IContainPointMode } from '../common/enums';
import type { IFace3d } from './graphic/face3d';
import type { IPickerService } from './picker';

type IStrokeSeg = {
  /**
   * 百分比
   */
  start: number;
  /**
   * 百分比
   * end和length二选一
   */
  end: number;
  /**
   * 像素长度
   */
  length: number;
};

// TODO 最后加一个any
export type GraphicType =
  | 'area'
  | 'circle'
  | 'ellipse'
  | 'line'
  | 'rect'
  | 'rect3d'
  | 'path'
  | 'richtext'
  | 'text'
  | 'arc'
  | 'arc3d'
  | 'image'
  | 'symbol'
  | 'group'
  | 'shadowroot'
  | 'polygon'
  | 'pyramid3d'
  | 'glyph'
  | string;

// Cursor style
// See: https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
export type Cursor =
  | 'auto'
  | 'default'
  | 'none'
  | 'context-menu'
  | 'help'
  | 'pointer'
  | 'progress'
  | 'wait'
  | 'cell'
  | 'crosshair'
  | 'text'
  | 'vertical-text'
  | 'alias'
  | 'copy'
  | 'move'
  | 'no-drop'
  | 'not-allowed'
  | 'grab'
  | 'grabbing'
  | 'all-scroll'
  | 'col-resize'
  | 'row-resize'
  | 'n-resize'
  | 'e-resize'
  | 's-resize'
  | 'w-resize'
  | 'ne-resize'
  | 'nw-resize'
  | 'se-resize'
  | 'sw-resize'
  | 'ew-resize'
  | 'ns-resize'
  | 'nesw-resize'
  | 'nwse-resize'
  | 'zoom-in'
  | 'zoom-out';

export type ITransform = {
  /**
   * x坐标
   */
  x: number;
  /**
   * y坐标
   */
  y: number;
  /**
   * z坐标
   */
  z: number;
  /**
   * x方向偏移量
   */
  dx: number;
  /**
   * y方向偏移量
   */
  dy: number;
  /**
   * z方向偏移量
   */
  dz: number;
  /**
   * x方向的滚动值
   */
  scrollX: number;
  /**
   * y方向的滚动值
   */
  scrollY: number;
  /**
   * x方向的缩放值
   */
  scaleX: number;
  /**
   * y方向的缩放值
   */
  scaleY: number;
  /**
   * z方向的缩放值
   */
  scaleZ: number;
  /**
   * 绕z轴的转角，即xy平面上的旋转角度
   */
  angle: number;
  /**
   * 绕x轴的转角
   */
  alpha: number;
  /**
   * 绕y轴的转角
   */
  beta: number;
  /**
   * 应用缩放的中心
   */
  scaleCenter: [number | string, number | string];
  /**
   * 基于AABB的锚点位置，用于简单的定位某些path
   */
  anchor: [number | string, number | string];
  /**
   * 3d的锚点位置
   */
  anchor3d: [number | string, number | string, number] | [number | string, number | string];
  /**
   * 处理矩阵，在正常计算完变换矩阵之后，会将该矩阵乘到变换矩阵上得到最终的变换矩阵
   */
  postMatrix: IMatrix;
};

export type IFillType = boolean | string | IColor;
export type IFillStyle = {
  /**
   * 图形的填充透明度
   */
  fillOpacity: number;
  /**
   * 图形模糊效果程度
   */
  shadowBlur: number;
  /**
   * 图形的阴影颜色
   */
  shadowColor: string;
  /**
   * 阴影水平偏移距离
   */
  shadowOffsetX: number;
  /**
   * 阴影垂直偏移距离
   */
  shadowOffsetY: number;
  /**
   * 图形的填充颜色
   */
  fill: IFillType;
};

export type ILayout = {
  /**
   * 设置对齐方式
   */
  alignSelf: 'auto' | 'flex-start' | 'flex-end' | 'center';
};

export type IBorderStyle = Omit<IStrokeStyle, 'outerBorder' | 'innerBorder'> & {
  /**
   * 边距离边缘的距离
   */
  distance: number | string;
  /**
   * 是否显示边框，默认是不显示的
   */
  visible?: boolean;
};

export type IStrokeType = boolean | string | IColor | null;
export type IStrokeStyle = {
  /**
   * 外部边框的样式配置，默认不展示外部边框
   */
  outerBorder: Partial<IBorderStyle>;
  /**
   * 内部边框的样式配置
   */
  innerBorder: Partial<IBorderStyle>;
  /**
   * 描边的透明度
   */
  strokeOpacity: number;
  /**
   * 设置线条虚线样式的属性，它通过定义实线和空白的交替长度来创建虚线效果
   */
  lineDash: number[];

  /**
   * 设置虚线样式的起始偏移量
   */
  lineDashOffset: number;

  /**
   * 设置线条的宽度
   */
  lineWidth: number;

  /**
   * 设置线条末端的样式
   */
  lineCap: CanvasLineCap;

  /**
   * 设置线条拐角的样式
   */
  lineJoin: CanvasLineJoin;

  /**
   * 设置线条拐角处的斜接限制
   */
  miterLimit: number;
  /**
   * 描边的boundsBuffer，用于控制bounds的buffer
   */
  strokeBoundsBuffer: number;
  /**
   * stroke - true 全描边
   * stroke - false 不描边
   * stroke 为数值类型，适用于rect\arc等图形，用于配置部分描边的场景，其中
   *
   * 0b00000 - 不描边
   * 0b000001 - top
   * 0b000010 - right
   * 0b000100 - bottom
   * 0b001000 - left
   * 相应的：
   * 0b000011 - top + right
   * 0b000111 - top + right + bottom
   * 0b001111 - 全描边
   *
   * stroke - boolean[]，适用于rect\arc等图形，用于配置部分描边的场景
   */
  stroke: IStrokeType[] | IStrokeType;
};

type TextureType = 'circle' | 'diamond' | 'rect' | 'vertical-line' | 'horizontal-line' | 'bias-lr' | 'bias-rl' | 'grid';

export type IConnectedStyle = {
  /**
   * 连接，取零或者断开
   */
  connectedType: 'connect' | 'none';
  /**
   * 连接线的样式配置
   */
  connectedStyle: {
    stroke: IStrokeStyle['stroke'];
    strokeOpacity: IStrokeStyle['strokeOpacity'];
    lineDash: IStrokeStyle['lineDash'];
    lineDashOffset: IStrokeStyle['lineDashOffset'];
    lineCap: IStrokeStyle['lineCap'];
    lineJoin: IStrokeStyle['lineJoin'];
    lineWidth: IStrokeStyle['lineWidth'];
    fill: IFillStyle['fill'];
    fillOpacity: IFillStyle['fillOpacity'];
  };
  connectedX: number;
  connectedY: number;
};

export type IBackgroundConfig = {
  stroke?: string | boolean;
  fill?: string | boolean;
  lineWidth?: number;
  cornerRadius?: number;
  expandX?: number;
  expandY?: number;
};

type IBackgroundType = string | HTMLImageElement | HTMLCanvasElement | IBackgroundConfig;

export interface SimpleDomStyleOptions {
  /**
   * 容器的宽度
   */
  width: number;
  /**
   * 容器的高度
   */
  height: number;
  /**
   * 容器的样式设置
   */
  style?:
    | string
    | Record<string, any>
    | ((
        pos: { top: number; left: number; width: number; height: number },
        graphic: IGraphic,
        wrapContainer: HTMLElement
      ) => Record<string, any>); // 容器的样式
}

export interface CommonDomOptions {
  /**
   * 全局唯一的id
   */
  id?: string;
  /**
   * 容器元素的id或者dom元素
   */
  container: string | HTMLElement | null;
  /**
   * 是否显示
   */
  visible?: boolean;
  /**
   * 是否支持事件冒泡
   */
  pointerEvents?: boolean | string;
  /**
   * 可穿透的事件列表
   * @since 0.21.2
   */
  penetrateEventList?: string[];
  /**
   * 定位类型
   * 'position' - 根据挂载图形节点的坐标也就是x,y进行定位
   * 'boundsLeftTop' - 定位到挂载图形节点bounds的左上角
   * 'left' - 定位到挂载图形节点bounds 的左侧
   * 'right' - 定位到挂载图形节点bounds 的右侧
   * 'bottom' - 定位到挂载图形节点bounds 的底部
   * 'top' - 定位到挂载图形节点bounds 的顶部
   * 'center' - 定位到挂载图形节点bounds 的中心
   * 'top-left' - 定位到挂载图形节点bounds 的左上角
   * 'top-right' - 定位到挂载图形节点bounds 的右上角
   * 'bottom-left' - 定位到挂载图形节点bounds 的左下角
   * 'bottom-right' - 定位到挂载图形节点bounds 的右下角
   */
  anchorType?: 'position' | 'boundsLeftTop' | BoundsAnchorType;
}

export type IGraphicStyle = ILayout &
  IFillStyle &
  IStrokeStyle &
  IPickStyle & {
    /**
     * 强制设置的bounds宽度，主要用于使用html或者react展示图形的时候，设置一个固定的宽度
     */
    forceBoundsWidth: number | (() => number) | undefined;
    /**
     * 强制设置的bounds高度，主要用于使用html或者react展示图形的时候，设置一个固定的高度
     */
    forceBoundsHeight: number | (() => number) | undefined;
    /**
     * 透明度，会同时影响填充和描边
     */
    opacity: number;
    /**
     * 影子节点
     */
    shadowGraphic?: IGraphic | undefined;
    /**
     * 背景填充模式（与具体图元有关）
     */
    backgroundMode: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
    /**
     * 是否正好填充，只在repeat-x或者repeat-y以及no-repeat的时候生效
     */
    backgroundFit: boolean;
    /**
     * 背景圆角半径
     */
    backgroundCornerRadius: number | number[];
    /**
     * 背景透明度
     */
    backgroundOpacity: number;
    /**
     * 背景，支持颜色字符串、html image元素、html canvas元素
     */
    background:
      | IBackgroundType
      | {
          /**
           * 背景，支持颜色字符串、html image元素、html canvas元素
           */
          background: IBackgroundType;
          /**
           * 背景的x方向偏移量
           */
          dx?: number;
          /**
           * 背景的y方向偏移量
           */
          dy?: number;
          /**
           * 背景宽度
           */
          width?: number;
          /**
           * 背景高度
           */
          height?: number;
          /**
           * 背景的x坐标
           */
          x?: number;
          /**
           * 背景的y坐标
           */
          y?: number;
        }
      | null; // 背景，可以与fill同时存在
    /**
     * 纹理的类型
     */
    texture: TextureType | string;
    /**
     * 纹理的颜色
     */
    textureColor: string;
    /**
     * 纹理的大小
     */
    textureSize: number;
    /**
     * 纹理的间隙
     */
    texturePadding: number;

    blur: number;
    /**
     * 设置图形对应的鼠标样式
     */
    cursor: Cursor | null;
    renderStyle?: 'default' | 'rough' | any;
    /**
     * HTML的dom或者string
     */
    html:
      | ({
          /**
           * dom字符串或者dom
           */
          dom: string | HTMLElement;
        } & SimpleDomStyleOptions &
          CommonDomOptions)
      | null;
    /**
     * 使用react元素渲染内容
     */
    react:
      | ({
          /**
           * react场景节点
           */
          element: any;
        } & SimpleDomStyleOptions &
          CommonDomOptions)
      | null;
  };

export type IPickStyle = {
  /**
   * 给stroke模式的pick额外加的buffer，用于外界控制stroke区域的pick范围
   */
  pickStrokeBuffer: number;
};

export type IDebugType = {
  _debug_bounds: boolean | ((c: any, g: any) => void);
};
export type IGraphicAttribute = IDebugType &
  IGraphicStyle &
  ITransform & {
    /**
     * stroke百分比
     */
    strokeSeg: IStrokeSeg | null;
    /**
     * 包围盒的padding
     */
    boundsPadding: number | number[];
    /**
     * 选择模式，精确模式，粗糙模式（包围盒模式），自定义模式
     */
    pickMode: 'accurate' | 'imprecise' | 'custom';
    boundsMode: 'accurate' | 'imprecise';
    customPickShape: () => boolean | null;
    /**
     * 是否支持事件拾取，默认为 true。
     * @default true
     */
    pickable: boolean;
    /**
     * 是否支持fill拾取，默认为 true。
     * @experimental
     * @default true
     */
    fillPickable: boolean;
    /**
     * 是否支持stroke拾取，默认为 true。
     * @experimental
     * @default true
     */
    strokePickable: boolean;
    /**
     * 对于 group 节点，是否支持其子元素的事件拾取，默认为 true。
     * 如果 group `pickable` 关闭，`childrenPickable` 开启，那么 group 的子节点仍参与事件拾取
     * @default true
     */
    childrenPickable: boolean;
    /**
     * 元素是否可见。
     * @default true
     */
    visible: boolean;
    /**
     * 分组下的层级，层级越小越先绘制
     */
    zIndex: number;
    layout: any;
    /**
     * 是否隐藏元素（只是绘制的时候不绘制）
     */
    renderable: boolean;
    /**
     * 是否在3d中控制方向
     * false: 不控制方向
     * true: 始终控制方向朝摄像机
     */
    keepDirIn3d?: boolean;
    shadowRootIdx: number;
    shadowPickMode?: 'full' | 'graphic';
    /**
     * 全局范围的层级，设置了这个属性的图形，会提取到交互层进行渲染
     */
    globalZIndex: number;
    /**
     * canvas 的合成方式
     */
    globalCompositeOperation: CanvasRenderingContext2D['globalCompositeOperation'] | '';
    /**
     * 完全支持滚动 | 完全不支持滚动 | 支持x方向的滚动 | 支持y方向的滚动
     */
    overflow: 'scroll' | 'hidden' | 'scroll-x' | 'scroll-y';
    /**
     * 绘制fill和stroke的顺序，为0表示fill先绘制，1表示stroke先绘制
     */
    fillStrokeOrder: number;
    /**
     * @since 0.20.15
     * 保持stroke的scale，默认为false，为true的话stroke显示的宽度会随着scale变化
     */
    keepStrokeScale: boolean;
  };

export interface IGraphicJson<T extends Partial<IGraphicAttribute> = Partial<IGraphicAttribute>> {
  attribute: Partial<T>;
  _uid: number;
  type: string;
  name: string;
  children: IGraphicJson<T>[];
}

/** the context of setAttribute */
export type ISetAttributeContext = {
  /** type of setAttribute */
  type?: number;
  animationState?: {
    step?: IStep;
    isFirstFrameOfStep?: boolean;
    /** ratio of animation */
    ratio?: number;
    /** is animation end? */
    end?: boolean;
  };
  skipUpdateCallback?: boolean;
};

export type IGraphicAnimateParams = {
  slience?: boolean;
  id?: number | string;
  onStart?: () => void;
  onFrame?: (step: IStep, ratio: number) => void;
  onEnd?: () => void;
  onRemove?: () => void;
  interpolate?: (key: string, ratio: number, from: any, to: any, nextAttributes: any) => boolean;
};

export interface IGraphic<T extends Partial<IGraphicAttribute> = Partial<IGraphicAttribute>>
  extends INode,
    IAnimateTarget {
  type?: GraphicType;
  numberType?: number;
  stage?: IStage;
  layer?: ILayer;
  shadowRoot?: IShadowRoot;
  glyphHost?: IGraphic<IGlyphGraphicAttribute>;
  backgroundImg?: boolean;
  attachedThemeGraphic?: IGraphic<any>;

  bindDom?: Map<
    string | HTMLElement,
    { container: HTMLElement | string; dom: HTMLElement | any; wrapGroup: HTMLDivElement | any; root?: any }
  >;

  valid: boolean;
  parent: IGroup | null;
  isContainer?: boolean;
  // 是否是3d模式（是否应用3d视角）
  in3dMode?: boolean;

  // 上次更新的stamp
  stamp?: number;
  animationBackUps?: {
    from: Record<string, any>;
    to: Record<string, any>;
  };

  attribute: Partial<T>;

  /** 用于实现morph动画场景，转换成bezier曲线渲染 */
  pathProxy?: ICustomPath2D | ((attrs: T) => ICustomPath2D);
  incremental?: number;
  incrementalAt?: number;

  /** 记录state对应的图形属性 */
  states?: Record<string, Partial<T>>;
  normalAttrs?: Partial<T>;
  stateProxy?: (stateName: string, targetStates?: string[]) => Partial<T>;
  findFace?: () => IFace3d;
  toggleState: (stateName: string, hasAnimation?: boolean) => void;
  removeState: (stateName: string, hasAnimation?: boolean) => void;
  clearStates: (hasAnimation?: boolean) => void;
  useStates: (states: string[], hasAnimation?: boolean) => void;
  addState: (stateName: string, keepCurrentStates?: boolean, hasAnimation?: boolean) => void;
  hasState: (stateName?: string) => boolean;
  getState: (stateName: string) => Partial<T>;
  onBeforeAttributeUpdate?: (
    val: any,
    attributes: Partial<T>,
    key: null | string | string[],
    context?: ISetAttributeContext
  ) => T | undefined;
  applyStateAttrs: (attrs: Partial<T>, stateNames: string[], hasAnimation?: boolean, isClear?: boolean) => void;
  updateNormalAttrs: (stateAttrs: Partial<T>) => void;

  // get
  readonly AABBBounds: IAABBBounds; // 用于获取当前节点的AABB包围盒
  readonly OBBBounds: IOBBBounds; // 获取OBB包围盒，旋转防重叠需要用
  readonly globalAABBBounds: IAABBBounds; // 全局AABB包围盒
  readonly transMatrix: IMatrix; // 变换矩阵，动态计算
  readonly globalTransMatrix: IMatrix; // 变换矩阵，动态计算

  getOffsetXY: (attr?: ITransform) => IPoint;

  // function
  containsPoint: (x: number, y: number, mode?: IContainPointMode, picker?: IPickerService) => boolean;

  setMode: (mode: '3d' | '2d') => void;
  isValid: () => boolean;

  // TODO: transform API
  // 基于当前transform的变换，普通用户尽量别用，拿捏不住的~
  translate: (x: number, y: number) => this;
  translateTo: (x: number, y: number) => this;
  scale: (scaleX: number, scaleY: number, scaleCenter?: IPointLike) => this;
  scaleTo: (scaleX: number, scaleY: number) => this;
  rotate: (angle: number, rotateCenter?: IPointLike) => this;
  rotateTo: (angle: number) => this;
  skewTo: (b: number, c: number) => this;
  addUpdateBoundTag: () => void;
  addUpdateShapeAndBoundsTag: () => void;
  addUpdateLayoutTag: () => void;

  update: (d?: { bounds: boolean; trans: boolean }) => void;

  // animate
  animate: (params?: IGraphicAnimateParams) => IAnimate;

  // 语法糖，可有可无，有的为了首屏性能考虑做成get方法，有的由外界直接托管，内部不赋值
  name?: string;

  // 供render处理shape缓存tag
  shouldUpdateShape: () => boolean;
  clearUpdateShapeTag: () => void;

  // // 供render缓存shape
  // cacheShape?: ICustomPath2D;
  // // 线段使用的path2D
  // cacheLine?: ISegPath2D | ISegPath2D[];
  // // 面积图使用的path2D
  // cacheArea?: IAreaCacheItem | IAreaCacheItem[];

  setAttributes: (params: Partial<T>, forceUpdateTag?: boolean, context?: ISetAttributeContext) => void;

  initAttributes: (params: Partial<T>) => void;

  setAttribute: (key: string, value: any, forceUpdateTag?: boolean, context?: ISetAttributeContext) => void;

  setStage: (stage?: IStage, layer?: ILayer) => void;
  onSetStage: (cb: (g: IGraphic, stage: IStage) => void) => void;

  shouldUpdateAABBBounds: () => boolean;
  shouldSelfChangeUpdateAABBBounds: () => boolean;
  shouldUpdateGlobalMatrix: () => boolean;

  addUpdatePositionTag: () => void;
  addUpdateGlobalPositionTag: () => void;

  attachShadow: () => IShadowRoot;
  detachShadow: () => void;

  toJson: () => IGraphicJson;

  /** 创建pathProxy */
  createPathProxy: (path?: string) => void;
  /** 将图形转换成CustomPath2D */
  toCustomPath?: () => ICustomPath2D;

  resources?: Map<
    string | HTMLImageElement | HTMLCanvasElement | IBackgroundConfig,
    { state: 'init' | 'loading' | 'success' | 'fail'; data?: HTMLImageElement | HTMLCanvasElement }
  >;
  imageLoadSuccess: (url: string, data: HTMLImageElement) => void;
  imageLoadFail: (url: string) => void;

  clone: () => IGraphic;
  stopAnimates: (stopChildren?: boolean) => void;
  getNoWorkAnimateAttr: () => Record<string, number>;
  getGraphicTheme: () => T;
}

export interface IRoot extends IGraphic {
  pick: (x: number, y: number) => IGraphic;
}

/**
 * 动画配置
 */
export type IAnimateConfig = {
  duration?: number;
  easing?: EasingType;
};

export type GraphicReleaseStatus = 'released' | 'willRelease';
