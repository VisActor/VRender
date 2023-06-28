// window为内部对象，属性均为stage传入

import type { IBoundsLike } from '@visactor/vutils';
import type { ICanvas } from './canvas';
import type { IContext2d } from './context';
import type { IDomRectLike, IEventElement, Releaseable } from './common';
import type { ISyncHook } from './sync-hook';
import type { IContribution } from './contribution';
import type { IGlobal } from './global';

// TODO: 参数考虑动态注入，比如CreateWindow是native的专用接口
export interface IWindowParams {
  canvas?: string | HTMLCanvasElement;
  offscreen?: boolean;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  dpr: number;
  container?: string | HTMLElement;
  canvasControled: boolean;
  title: string;
  CreateWindow?: (w: number, h: number, title: string) => void;
}

export interface IWindow
  extends Releaseable,
    Omit<IEventElement, 'on' | 'off' | 'once' | 'emit' | 'removeAllListeners'> {
  hooks: {
    onChange: ISyncHook<[number, number, number, number]>;
  };
  // 窗口的大小
  width: number;
  height: number;
  // // 窗口的位置
  // x: number;
  // y: number;
  // 窗口操作配置
  resizable: boolean;
  minHeight: number;
  minWidth: number;
  maxHeight: number;
  maxWidth: number;
  // 窗口配置
  title: string;
  dpr: number;
  style: CSSStyleDeclaration | Record<string, any>;

  create: (options: IWindowParams) => void;
  setWindowHandler: (handler: IWindowHandlerContribution) => void;
  setDpr: (dpr: number) => void;
  resize: (w: number, h: number) => void;
  configure: () => void;

  // 获取上下文和canvas，可以是2d也可以是GL
  getContext: () => IContext2d;
  getNativeHandler: () => ICanvas;
  getContainer: () => HTMLElement | any;
  getImageBuffer: (type?: string) => any;

  clearViewBox: (viewBox: IBoundsLike, color?: string) => void;

  getBoundingClientRect: () => IDomRectLike;
}

export interface IWindowHandlerContribution
  extends IContribution<IWindow>,
    Omit<IEventElement, 'on' | 'off' | 'once' | 'emit' | 'removeAllListeners'> {
  container?: any;

  configure: (window: IWindow, global: IGlobal) => void;
  createWindow: (params: IWindowParams) => void;
  releaseWindow: () => void;
  resizeWindow: (width: number, height: number) => void;
  setDpr: (dpr: number) => void;
  getDpr: () => number;
  getWH: () => { width: number; height: number };
  getXY: () => { x: number; y: number };
  getTitle: () => string;

  // 获取上下文和canvas，可以是2d也可以是GL
  getContext: () => IContext2d;
  getNativeHandler: () => ICanvas;
  getImageBuffer?: (type?: string) => any;
  release: (...params: any) => void;

  getStyle: () => CSSStyleDeclaration | Record<string, any>;
  setStyle: (s: CSSStyleDeclaration | Record<string, any>) => void;

  getBoundingClientRect: () => IDomRectLike;
  clearViewBox: (vb: IBoundsLike, color?: string) => void;
}
