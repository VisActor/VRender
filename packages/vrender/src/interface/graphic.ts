import type { IAABBBounds, IOBBBounds, IMatrix, IPointLike, IPoint } from '@visactor/vutils';
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

type IStrokeSeg = {
  start: number; // 百分比
  // end和length二选一
  end: number; // 百分比
  length: number; // 像素长度
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
  | 'glyph';

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
  x: number;
  y: number;
  z: number;
  dx: number;
  dy: number;
  dz: number;
  scrollX: number;
  scrollY: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  angle: number;
  alpha: number;
  beta: number;
  anchor: [number | string, number | string]; // 基于AABB的锚点位置，用于简单的定位某些path
  anchor3d: [number | string, number | string, number] | [number | string, number | string]; // 3d的锚点位置
  postMatrix: IMatrix;
};

export type IFillType = boolean | string | IColor;
export type IFillStyle = {
  fillOpacity: number;
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  fill: IFillType;
};

export type IBorderStyle = Omit<IStrokeStyle, 'outerBorder' | 'innerBorder'> & {
  distance: number | string;
};

export type IStrokeType = boolean | string | IColor | null;
export type IStrokeStyle = {
  outerBorder: Partial<IBorderStyle>;
  innerBorder: Partial<IBorderStyle>;
  strokeOpacity: number;
  lineDash: number[];
  lineDashOffset: number;
  lineWidth: number;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
  miterLimit: number;
  // 描边的boundsBuffer，用于控制bounds的buffer
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

export type IGraphicStyle = IFillStyle &
  IStrokeStyle & {
    opacity: number;
    backgroundMode: number; // 填充模式（与具体图元有关）
    background: string | HTMLImageElement | HTMLCanvasElement | null; // 背景，可以与fill同时存在
    texture: TextureType | string; // 纹理
    textureColor: string; // 纹理颜色
    textureSize: number; // 纹理大小
    texturePadding: number; // 纹理间隙
    blur: number;
    cursor: Cursor | null; // 鼠标样式
  };

export type IGraphicAttribute = IGraphicStyle &
  ITransform & {
    /**
     * stroke百分比
     */
    strokeSeg: IStrokeSeg | null;
    // 包围盒的padding
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
    zIndex: number;
    layout: any;
    /**
     * 是否在3d中控制方向
     * false: 不控制方向
     * true: 始终控制方向朝摄像机
     */
    keepDirIn3d?: boolean;
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
};

export type IGraphicAnimateParams = {
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
  containsPoint: (x: number, y: number, mode?: IContainPointMode) => boolean;

  setMode: (mode: '3d' | '2d') => void;
  isValid: () => boolean;

  // TODO: transform API
  // 基于当前transform的变换，普通用户尽量别用，拿捏不住的~
  translate: (x: number, y: number) => this;
  translateTo: (x: number, y: number) => this;
  scale: (scaleX: number, scaleY: number, scaleCenter?: IPointLike) => this;
  scaleTo: (scaleX: number, scaleY: number) => this;
  rotate: (angle: number) => this;
  rotateTo: (angle: number) => this;
  skewTo: (b: number, c: number) => this;
  addUpdateBoundTag: () => void;
  addUpdateShapeAndBoundsTag: () => void;

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
    string | HTMLImageElement | HTMLCanvasElement,
    { state: 'init' | 'loading' | 'success' | 'fail'; data?: HTMLImageElement | HTMLCanvasElement }
  >;
  imageLoadSuccess: (url: string, data: HTMLImageElement) => void;
  imageLoadFail: (url: string) => void;

  clone: () => IGraphic;
  stopAnimates: () => void;
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
