import type { Dict, IAABBBoundsLike, IPointLike } from '@visactor/vutils';
import type { ICanvasLike } from './canvas';
import type { IEventElement } from './common';
import type { IContribution } from './contribution';
import type { ISyncHook } from './sync-hook';

export interface ILoader {
  loadImage: (url: string) => HTMLImageElement | ImageData;
  loadJson: (url: string) => JSON;
}

// 环境定义
export type EnvType = 'browser' | 'feishu' | 'tt' | 'taro' | 'node' | 'native' | 'lynx' | 'wx' | 'harmony';

// 创建canvas需要的参数
export interface ICreateCanvasParams {
  id?: string;
  // 像素宽
  width?: number;
  // 像素高
  height?: number;
  dpr?: number;
}

export interface ILoader {
  loadImage: (url: string) => HTMLImageElement | ImageData;
  loadJson: (url: string) => JSON;
}

export interface IEnvContribution
  extends IContribution<IGlobal>,
    Omit<IEventElement, 'on' | 'off' | 'once' | 'emit' | 'removeAllListeners'> {
  // 当前代码所运行的环境
  type: EnvType;

  // 是否支持事件
  // node环境不需要事件
  supportEvent: boolean;

  // 开始配置环境，相当于init
  configure: (global: IGlobal, ...p: any) => void;

  // 创建销毁
  createCanvas: (params: ICreateCanvasParams) => ICanvasLike | any;
  createOffscreenCanvas: (params: ICreateCanvasParams) => ICanvasLike | any;
  releaseCanvas: (canvas: ICanvasLike | string | any) => void;

  getNativeAABBBounds: (dom: string | HTMLElement | any) => IAABBBoundsLike;
  removeDom: (dom: HTMLElement) => boolean;
  createDom: (params: CreateDOMParamsType) => HTMLElement | null;
  updateDom: (dom: HTMLElement, params: CreateDOMParamsType) => boolean;
  getElementTop: (dom: any, baseWindow?: boolean) => number;
  getElementLeft: (dom: any, baseWindow?: boolean) => number;
  getElementTopLeft: (dom: any, baseWindow?: boolean) => { top: number; left: number };

  /**
   * 获取动态canvas的数量，offscreenCanvas或者framebuffer
   */
  getDynamicCanvasCount: () => number;

  /**
   * 获取静态canvas的数量，纯粹canvas
   */
  getStaticCanvasCount: () => number;

  // 设备信息
  getDevicePixelRatio: () => number;

  // 通用接口
  getRequestAnimationFrame: () => (callback: FrameRequestCallback) => number;
  getCancelAnimationFrame: () => (h: number) => void;

  // DOM接口
  getElementById?: (str: string) => HTMLElement | null;
  getRootElement?: () => HTMLElement | null;
  /**
   * get document instance
   */
  getDocument?: () => Document | null;
  /**
   * whether supports TouchEvent.
   */
  supportsTouchEvents: boolean;
  /**
   * whether supports PointerEvent.
   */
  supportsPointerEvents: boolean;
  /**
   * whether supports MouseEvent.
   */
  supportsMouseEvents: boolean;
  /**
   * Whether to allow setting the cursor style
   */
  applyStyles?: boolean;

  /**
   * 将窗口坐标转换为画布坐标，小程序/小组件环境需要兼容
   */
  mapToCanvasPoint?: (event: any, domElement?: any) => IPointLike | null;

  loadImage: (url: string) => Promise<{
    loadState: 'success' | 'fail';
    data: HTMLImageElement | ImageData | null;
  }>;
  loadSvg: (url: string) => Promise<{
    loadState: 'success' | 'fail';
    data: HTMLImageElement | ImageData | null;
  }>;
  loadJson: (url: string) => Promise<{
    loadState: 'success' | 'fail';
    data: Record<string, unknown> | null;
  }>;
  loadArrayBuffer: (url: string) => Promise<{
    loadState: 'success' | 'fail';
    data: ArrayBuffer | null;
  }>;
  loadBlob: (url: string) => Promise<{
    loadState: 'success' | 'fail';
    data: Blob | null;
  }>;
  // @since 0.21.3
  /**
   * 加载字体，参数对应Font类
   * @param font 字体名
   * @param source 数据源
   * @param descriptors 其他描述
   * @returns
   */
  loadFont: (
    font: string,
    source: string | BinaryData,
    descriptors?: FontFaceDescriptors
  ) => Promise<{
    loadState: 'success' | 'fail';
  }>;
}

export type IMiniAppEnvParams = {
  /** dom 容器对象 */
  domref?: Dict<any>;
  /**
   * 强行设置env，如果env重复设置也设置
   */
  force?: boolean;
  /**
   * 可用的canvas列表
   */
  canvasIdLists?: (string | number)[];
  /**
   * 表示可以自由使用的canvas索引
   */
  freeCanvasIdx?: string | number;
  /** taro 环境使用 */
  taro?: any;
  pixelRatio?: number;
  [key: string]: any;
};

export interface IEnvParamsMap {
  readonly taro: IMiniAppEnvParams;
  readonly feishu: IMiniAppEnvParams;
  readonly tt: IMiniAppEnvParams;
  readonly browser: any;
  readonly node: any;
  readonly native: any;
  readonly lynx: any;
  readonly wx: any;
  readonly harmony: any;
}

export type CreateDOMParamsType = {
  tagName?: string;
  width?: number;
  height?: number;
  style?: string | Record<string, any>;
  parent?: string | HTMLElement;
};
export interface IGlobal extends Omit<IEventElement, 'on' | 'off' | 'once' | 'emit' | 'removeAllListeners'> {
  // 当前代码所运行的环境
  env: EnvType;

  // 设备的dpr
  devicePixelRatio: number;

  // 当设置env的时候被调用
  hooks: {
    onSetEnv: ISyncHook<[EnvType | undefined, EnvType, IGlobal]>;
  };

  // 设置env的时候传入的参数
  // node环境需要传入整个node-canvas包
  // 小程序环境需要传入小程序要用到的参数
  envParams?: any;

  // 是否支持事件
  // node环境不需要事件
  supportEvent: boolean;

  // 是否在不显示canvas的时候停止绘图操作，默认false
  optimizeVisible: boolean;

  setEnv: (env: EnvType, params?: IEnvParamsMap[EnvType]) => void;
  setActiveEnvContribution: (contribution: IEnvContribution) => void;
  createCanvas: (params: ICreateCanvasParams) => HTMLCanvasElement | any;
  createOffscreenCanvas: (params: ICreateCanvasParams) => HTMLCanvasElement | any;
  releaseCanvas: (canvas: HTMLCanvasElement | string | any) => void;

  /**
   * 获取环境中最大动态canvas的数量，offscreenCanvas或者framebuffer
   */
  getDynamicCanvasCount: () => number;

  isChrome: () => boolean;
  isSafari: () => boolean;

  /**
   * 获取环境中最大静态canvas的数量，纯粹canvas
   */
  getStaticCanvasCount: () => number;

  /* 浏览器环境 - dom tree */
  getElementById: (str: string) => HTMLElement | null;
  getRootElement: () => HTMLElement | null;
  /**
   * get document instance
   */
  getDocument: () => Document | null;
  /**
   * whether supports TouchEvent.
   */
  supportsTouchEvents: boolean;
  /**
   * whether supports PointerEvent.
   */
  supportsPointerEvents: boolean;
  /**
   * whether supports MouseEvent.
   */
  supportsMouseEvents: boolean;
  /**
   * Whether to allow setting the cursor style
   */
  applyStyles?: boolean;
  /**
   * 测量文字的方法
   */
  measureTextMethod: 'native' | 'simple' | 'quick';

  getRequestAnimationFrame: () => null | ((callback: FrameRequestCallback) => number);
  getCancelAnimationFrame: () => null | ((h: number) => void);

  /**
   * 将窗口坐标转换为画布坐标，小程序/小组件环境需要兼容
   */
  mapToCanvasPoint: (nativeEvent: any, domElement?: any) => IPointLike | null;

  loadImage: (url: string) => Promise<{
    loadState: 'success' | 'fail';
    data: HTMLImageElement | ImageData | null;
  }>;
  loadSvg: (url: string) => Promise<{
    loadState: 'success' | 'fail';
    data: HTMLImageElement | ImageData | null;
  }>;
  loadJson: (url: string) => Promise<{
    loadState: 'success' | 'fail';
    data: Record<string, unknown> | null;
  }>;
  loadArrayBuffer: (url: string) => Promise<{
    loadState: 'success' | 'fail';
    data: ArrayBuffer | null;
  }>;
  loadBlob: (url: string) => Promise<{
    loadState: 'success' | 'fail';
    data: Blob | null;
  }>;

  removeDom: (dom: HTMLElement) => boolean;
  createDom: (params: CreateDOMParamsType) => HTMLElement | null;
  updateDom: (dom: HTMLElement, params: CreateDOMParamsType) => boolean;

  getElementTop: (dom: any, baseWindow?: boolean) => number;
  getElementLeft: (dom: any, baseWindow?: boolean) => number;
  getElementTopLeft: (dom: any, baseWindow?: boolean) => { top: number; left: number };

  isImageAnonymous: boolean;
}
