import type { INode } from './node-tree';
import type { ILayer, LayerMode } from './layer';
import type { IGraphic } from './graphic';
import type { IGroup } from './graphic/group';
import type { IColor } from './color';
import type { IAABBBounds, IBounds, IBoundsLike, IMatrix, IPointLike } from '@visactor/vutils';
import type { ICamera } from './camera';
import type { vec3 } from './matrix';
import type { IDirectionLight } from './light';
import type { ISyncHook } from './sync-hook';
import type { IDrawContext, IRenderService } from './render';
import type { ITicker, ITimeline } from './animate';
import type { IPickerService, PickResult } from './picker';
import type { IPluginService } from './plugin';
import type { IWindow } from './window';
import type { ILayerService } from './core';

export type IExportType = 'canvas' | 'imageData';

export interface IStageParams {
  // x: number;
  // y: number;
  // // 视口的宽高
  // viewWidth: number;
  // viewHeight: number;

  // 视口的宽高
  viewBox: IBoundsLike;
  // 总的宽高
  width: number;
  height: number;
  dpr: number;
  // stage的背景
  background: string | IColor;
  // 外部的canvas
  canvas: string | HTMLCanvasElement;
  // canvas的container容器，如果不传入canvas，那就会在容器中创建canvas
  container: string | HTMLElement;
  // 是否是受控制的canvas，如果不是的话，不会进行resize等操作，也不会修改canvas的样式
  canvasControled: boolean;
  title: string;
  // 是否开启自动渲染
  autoRender: boolean;
  // 是否开启布局支持
  enableLayout: boolean;
  // 是否关闭脏矩形检测
  disableDirtyBounds: boolean;
  // 是否支持interactiveLayer，默认为true
  interactiveLayer: boolean;
  // 是否支持HTML属性
  enableHtmlAttribute: string | boolean | HTMLElement;
  poptip: boolean;
  // 绘制之前的钩子函数
  beforeRender: (stage: IStage) => void;
  // 绘制之后的钩子函数
  afterRender: (stage: IStage) => void;
  renderStyle?: string;
  ticker?: ITicker;
  pluginList?: string[];
  // 优化配置
  optimize?: IOptimizeType;
}

export type IOptimizeType = {
  // 视口不在可视区，跳过渲染，默认为true
  skipRenderWithOutRange?: boolean;
};

export interface IOption3D {
  enableView3dTransform?: boolean; // 是否开启view3d自动旋转
  alpha?: number; // x轴的转角
  beta?: number; // y轴的转角
  gama?: number; // z轴的转角
  center?: { x?: number; y?: number; z?: number; dx?: number; dy?: number; dz?: number }; // 中心位置
  fieldRatio?: number; // 透视的视域缩放比例
  fieldDepth?: number;
  light?: {
    dir?: vec3;
    color?: string;
    ambient?: number;
  };
  // 配置相机后，alpha、beta、gamma配置会失效
  camera?: any; // 相机配置
}

// TODO 命名方式
export interface IStage extends INode {
  stage?: IStage;
  parent: IStage | null;
  // rootNode: IStage;
  x: number;
  y: number;

  params: Partial<IStageParams>;

  window: IWindow;

  width: number;
  height: number;
  viewWidth: number;
  viewHeight: number;
  defaultLayer: ILayer;
  dirtyBounds: IBounds | null;

  autoRender: boolean;
  renderCount: number;

  hooks: {
    beforeRender: ISyncHook<[IStage]>;
    afterRender: ISyncHook<[IStage]>;
  };

  option3d?: IOption3D;

  set3dOptions: (options: IOption3D) => void;
  light?: IDirectionLight;
  camera?: ICamera;

  dpr: number;

  viewBox: IBoundsLike;
  background: string | IColor;
  ticker: ITicker;
  increaseAutoRender: boolean;
  readonly renderService: IRenderService;
  readonly pickerService: IPickerService;
  readonly pluginService: IPluginService;
  readonly layerService: ILayerService;
  // 如果传入CanvasId，如果存在相同Id，说明这两个图层使用相同的Canvas绘制
  // 但需要注意的是依然是两个图层（用于解决Table嵌入ChartSpace不影响Table的绘制）
  createLayer: (canvasId?: string, layerMode?: LayerMode) => ILayer;
  getLayer: (name: string) => ILayer;
  sortLayer: (cb: (layer1: ILayer, layer2: ILayer) => number) => void;
  removeLayer: (layerId: number) => ILayer | false;

  getTimeline: () => ITimeline;

  render: (layers?: ILayer[], params?: Partial<IDrawContext>) => void;
  /**
   * 下一帧渲染
   * @param layers 渲染的图层
   * @param force 是否强行下一帧渲染，不采取优化方案
   * @returns
   */
  renderNextFrame: (layers?: ILayer[], force?: boolean) => void;
  tryInitInteractiveLayer: () => void;

  // 画布操作
  resize: (w: number, h: number, rerender?: boolean) => void;
  resizeWindow: (w: number, h: number, rerender?: boolean) => void;
  resizeView: (w: number, h: number, rerender?: boolean) => void;
  setViewBox:
    | ((viewBox: IBoundsLike, rerender: boolean) => void)
    | ((x: number, y: number, w: number, h: number, rerender: boolean) => void)
    | ((x: number | IBoundsLike, y: number | boolean, w?: number, h?: number, rerender?: boolean) => void);
  setDpr: (dpr: number, rerender?: boolean) => void;
  setOrigin: (x: number, y: number) => void;
  export: (type: IExportType) => HTMLCanvasElement | ImageData;
  pick: (x: number, y: number) => PickResult | false;

  // 动画相关
  startAnimate: (t: number) => void;
  setToFrame: (t: number) => void;
  dirty: (b: IBounds, matrix?: IMatrix) => void;
  // 考虑操作回放

  renderTo: (window: IWindow, params: { x: number; y: number; width: number; height: number }) => void;

  renderToNewWindow: (fullImage?: boolean) => IWindow;

  toCanvas: (fullImage?: boolean, viewBox?: IAABBBounds) => HTMLCanvasElement | null;

  setBeforeRender: (cb: (stage: IStage) => void) => void;

  setAfterRender: (cb: (stage: IStage) => void) => void;

  afterNextRender: (cb: (stage: IStage) => void) => void;
  enableAutoRender: () => void;
  disableAutoRender: () => void;
  enableIncrementalAutoRender: () => void;
  disableIncrementalAutoRender: () => void;
  enableDirtyBounds: () => void;
  disableDirtyBounds: () => void;
  enableView3dTransform: () => void;
  disableView3dTranform: () => void;
  clearViewBox: (color?: string) => void;
  release: () => void;
  setStage: (stage?: IStage) => void;

  setCursor: (mode?: string) => void;
}

export declare function combineStage(srages: IStage[], params: { canvas: string | HTMLCanvasElement }): IStage;
