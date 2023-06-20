import { INode } from './node-tree';
import { ILayer } from './layer';
import { IGraphic } from './graphic';
import { IGroup } from './graphic/group';
import { IColor } from './color';
import { IBounds, IBoundsLike, IMatrix, IMatrixLike, IPointLike } from '@visactor/vutils';
import { SyncHook } from '../tapable';
import { IWindow } from '../core';
import { IDrawContext, IRenderService } from '../render';
import { ICamera } from './camera';
import { vec3 } from './matrix';
import { IDirectionLight } from './light';
import { ITicker } from '../animate';
import { IPluginService } from '../plugins/plugin-service';
import { IPickerService } from '../picker';

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
  autoRender: boolean;
  disableDirtyBounds: boolean;
  // 绘制之前的钩子函数
  beforeRender: (stage: IStage) => void;
  // 绘制之后的钩子函数
  afterRender: (stage: IStage) => void;
  renderStyle?: string;
  ticker?: ITicker;
}

export interface IOption3D {
  enableView3dTransform?: boolean; // 是否开启view3d自动旋转
  alpha?: number; // x轴的转角
  beta?: number; // y轴的转角
  gama?: number; // z轴的转角
  center?: IPointLike; // 中心位置
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
    beforeRender: SyncHook<[IStage]>;
    afterRender: SyncHook<[IStage]>;
  };

  renderService: IRenderService;

  option3d?: IOption3D;

  set3dOptions: (options: IOption3D) => void;
  light?: IDirectionLight;
  camera?: ICamera;

  dpr: number;

  viewBox: IBoundsLike;
  background: string | IColor;
  ticker: ITicker;
  increaseAutoRender: boolean;
  readonly pickerService: IPickerService;
  readonly pluginService: IPluginService;
  // 如果传入CanvasId，如果存在相同Id，说明这两个图层使用相同的Canvas绘制
  // 但需要注意的是依然是两个图层（用于解决Table嵌入ChartSpace不影响Table的绘制）
  createLayer: (canvasId?: string) => ILayer;
  sortLayer: (cb: (layer: ILayer) => number) => void;
  removeLayer: (layerId: number) => ILayer | false;

  render: (layers?: ILayer[], params?: Partial<IDrawContext>) => void;
  renderNextFrame: (layers?: ILayer[]) => void;

  // 画布操作
  resize: (w: number, h: number, rerender?: boolean) => void;
  resizeWindow: (w: number, h: number, rerender?: boolean) => void;
  resizeView: (w: number, h: number, rerender?: boolean) => void;
  setViewBox:
    | ((viewBox: IBoundsLike, rerender: boolean) => void)
    | ((x: number, y: number, w: number, h: number, rerender: boolean) => void)
    | ((x: number | IBoundsLike, y: number | boolean, w?: number, h?: number, rerender?: boolean) => void);
  setDpr: (dpr: number) => void;
  setOrigin: (x: number, y: number) => void;
  export: (type: IExportType) => HTMLCanvasElement | ImageData;
  pick: (x: number, y: number) => { graphic: IGraphic | null; group: IGroup | null } | false;

  // 动画相关
  startAnimate: (t: number) => void;
  setToFrame: (t: number) => void;
  dirty: (b: IBounds, matrix?: IMatrix) => void;
  // 考虑操作回放

  renderTo: (window: IWindow, params: { x: number; y: number; width: number; height: number }) => void;

  renderToNewWindow: (fullImage?: boolean) => IWindow;

  toCanvas: (fullImage?: boolean) => HTMLCanvasElement | null;

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
