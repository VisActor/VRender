import { Dict, IPoint } from '@visactor/vutils';
import type { SyncHook } from '../tapable';
import { ICanvasLike } from './canvas';
import { IEventElement } from './common';
import { IContribution } from './contribution';

export interface ILoader {
  loadImage: (url: string) => HTMLImageElement | ImageData;
  loadJson: (url: string) => JSON;
}

// 环境定义
export type EnvType = 'browser' | 'feishu' | 'tt' | 'taro' | 'node' | 'native' | 'lynx';

export const EnvContribution = Symbol.for('EnvContribution');

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
  mapToCanvasPoint?: (event: any) => IPoint | null;

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
}

export const Global = Symbol.for('Global');
export interface IGlobal extends Omit<IEventElement, 'on' | 'off' | 'once' | 'emit' | 'removeAllListeners'> {
  // 当前代码所运行的环境
  env: EnvType;

  // 设备的dpr
  devicePixelRatio: number;

  // 当设置env的时候被调用
  hooks: {
    onSetEnv: SyncHook<[EnvType | undefined, EnvType, IGlobal]>;
  };

  // 设置env的时候传入的参数
  // node环境需要传入整个node-canvas包
  // 小程序环境需要传入小程序要用到的参数
  envParams?: any;

  // 是否支持事件
  // node环境不需要事件
  supportEvent: boolean;

  setEnv: (env: EnvType, params?: IEnvParamsMap[EnvType]) => void;
  setActiveEnvContribution: (contribution: IEnvContribution) => void;
  createCanvas: (params: ICreateCanvasParams) => HTMLCanvasElement | any;
  createOffscreenCanvas: (params: ICreateCanvasParams) => HTMLCanvasElement | any;
  releaseCanvas: (canvas: HTMLCanvasElement | string | any) => void;

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
  mapToCanvasPoint: (nativeEvent: any) => IPoint | null;

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
}
