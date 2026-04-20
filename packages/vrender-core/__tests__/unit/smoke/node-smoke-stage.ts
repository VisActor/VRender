import type { EnvType, ICanvas, ICreateCanvasParams, IStage, IStageParams } from '../../../src/interface';
import { application } from '../../../src/application';
import { BaseCanvas } from '../../../src/canvas/contributions/base-canvas';
import { EmptyContext2d } from '../../../src/canvas/empty-context';
import { CanvasFactory, Context2dFactory } from '../../../src/canvas/constants';
import { EnvContribution } from '../../../src/constants';
import {
  DynamicLayerHandlerContribution,
  StaticLayerHandlerContribution,
  VirtualLayerHandlerContribution
} from '../../../src/core/constants';
import { BaseEnvContribution } from '../../../src/core/contributions/env/base-contribution';
import { CanvasLayerHandlerContribution } from '../../../src/core/contributions/layerHandler/canvas2d-contribution';
import { OffscreenLayerHandlerContribution } from '../../../src/core/contributions/layerHandler/offscreen2d-contribution';
import { EmptyLayerHandlerContribution } from '../../../src/core/contributions/layerHandler/empty-contribution';
import { BaseWindowHandlerContribution } from '../../../src/core/contributions/window/base-contribution';
import { WindowHandlerContribution } from '../../../src/core/window';
import { DefaultGraphicService } from '../../../src/graphic/graphic-service/graphic-service';
import {
  configureRuntimeApplicationForApp,
  createNodeApp,
  getRuntimeInstallerBindingContext,
  getRuntimeInstallerGlobal,
  installRuntimeDrawContributionsToApp,
  installRuntimeGraphicRenderersToApp
} from '../../../src/entries';

type NativeCanvasLike = {
  id?: string;
  width: number;
  height: number;
  style?: Record<string, unknown>;
  offsetLeft?: number;
  offsetTop?: number;
  getBoundingClientRect?: () => { left: number; top: number; width: number; height: number };
  getContext?: (type?: string) => Record<string, unknown>;
};

const NODE_SMOKE_ENV: EnvType = 'node';

function noop(): void {
  return;
}

function createGradientMock() {
  return {
    addColorStop: noop
  } as CanvasGradient;
}

function createNativeCanvas(width: number, height: number, nativeCanvas?: NativeCanvasLike): NativeCanvasLike {
  const canvas =
    nativeCanvas ??
    ({
      width,
      height,
      style: {},
      offsetLeft: 0,
      offsetTop: 0,
      getBoundingClientRect: () => ({ left: 0, top: 0, width, height })
    } as NativeCanvasLike);

  canvas.width = width;
  canvas.height = height;
  canvas.getContext =
    canvas.getContext ??
    (() =>
      ({
        canvas,
        isPointInPath: () => false,
        isPointInStroke: () => false,
        getImageData: () => ({ data: new Uint8ClampedArray(width * height * 4) }),
        measureText: (text: string) => ({ width: String(text).length * 10 }),
        createLinearGradient: () => createGradientMock(),
        createRadialGradient: () => createGradientMock(),
        createConicGradient: () => ({ addColorStop: noop }),
        createPattern: () => ({})
      } as Record<string, unknown>));

  return canvas;
}

class NodeSmokeContext2d extends EmptyContext2d {
  static env: EnvType = NODE_SMOKE_ENV;
  camera: null = null;
  private readonly ownerCanvas: ICanvas;

  constructor(canvas: ICanvas, dpr: number) {
    super(canvas, dpr);
    (this as any).canvas = canvas;
    this.ownerCanvas = canvas;
  }

  getCanvas(): ICanvas {
    return this.ownerCanvas;
  }

  getContext(): NodeSmokeContext2d {
    return this;
  }

  measureText(text: string): { width: number } {
    return { width: String(text).length * 10 };
  }

  getImageData(sx: number, sy: number, sw: number, sh: number): ImageData {
    return {
      data: new Uint8ClampedArray(sw * sh * 4),
      colorSpace: 'srgb',
      height: sh,
      width: sw
    } as ImageData;
  }

  createLinearGradient(): CanvasGradient {
    return createGradientMock();
  }

  createRadialGradient(): CanvasGradient {
    return createGradientMock();
  }

  createConicGradient() {
    return { addColorStop: noop } as any;
  }

  createPattern(): CanvasPattern {
    return {} as CanvasPattern;
  }

  project(x: number, y: number, _z: number) {
    return { x, y };
  }

  release(): void {
    return;
  }
}

class NodeSmokeCanvas extends BaseCanvas {
  static env: EnvType = NODE_SMOKE_ENV;

  init(): void {
    this._context = new NodeSmokeContext2d(this, this._dpr);
    this.nativeCanvas.width = this._pixelWidth;
    this.nativeCanvas.height = this._pixelHeight;
  }

  resize(width: number, height: number): void {
    this.width = width * this._dpr;
    this.height = height * this._dpr;
    this.nativeCanvas.width = this._pixelWidth;
    this.nativeCanvas.height = this._pixelHeight;
  }

  release(): void {
    return;
  }
}

class NodeSmokeEnvContribution extends BaseEnvContribution {
  type: EnvType = NODE_SMOKE_ENV;
  supportEvent = false;
  supportsTouchEvents = false;
  supportsPointerEvents = false;
  supportsMouseEvents = false;
  applyStyles = false;

  loadImage() {
    return Promise.resolve({ loadState: 'fail' as const, data: null });
  }

  loadSvg() {
    return Promise.resolve({ loadState: 'fail' as const, data: null });
  }

  createCanvas(params: ICreateCanvasParams): NativeCanvasLike {
    return createNativeCanvas(params.width, params.height);
  }

  createOffscreenCanvas(params: ICreateCanvasParams): NativeCanvasLike {
    return this.createCanvas(params);
  }

  releaseCanvas(): void {
    return;
  }

  getDevicePixelRatio(): number {
    return 1;
  }

  getRequestAnimationFrame(): (callback: FrameRequestCallback) => number {
    return (callback: FrameRequestCallback) => setTimeout(() => callback(Date.now()), 16) as unknown as number;
  }

  getCancelAnimationFrame(): (h: number) => void {
    return (handle: number) => clearTimeout(handle);
  }

  addEventListener(): void {
    return;
  }

  removeEventListener(): void {
    return;
  }

  dispatchEvent(): boolean {
    return false;
  }

  release(): void {
    return;
  }
}

class NodeSmokeWindowHandlerContribution extends BaseWindowHandlerContribution {
  type: EnvType = NODE_SMOKE_ENV;
  canvas!: NodeSmokeCanvas;
  private width = 0;
  private height = 0;
  private dpr = 1;

  get container(): null {
    return null;
  }

  getTitle(): string {
    return '';
  }

  getWH(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  getXY(): { x: number; y: number } {
    return { x: 0, y: 0 };
  }

  createWindow(params: any): void {
    const dpr = params.dpr ?? 1;
    const width = params.width ?? params.canvas?.width ?? 0;
    const height = params.height ?? params.canvas?.height ?? 0;
    const nativeCanvas = createNativeCanvas(width * dpr, height * dpr, params.canvas);

    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.canvas = new NodeSmokeCanvas({
      width,
      height,
      dpr,
      nativeCanvas: nativeCanvas as any,
      canvasControled: params.canvasControled
    });
  }

  releaseWindow(): void {
    this.canvas?.release();
  }

  resizeWindow(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas?.resize(width, height);
  }

  setDpr(dpr: number): void {
    this.dpr = dpr;
    if (this.canvas) {
      this.canvas.dpr = dpr;
    }
  }

  getContext() {
    return this.canvas.getContext();
  }

  getNativeHandler(): ICanvas {
    return this.canvas;
  }

  getDpr(): number {
    return this.dpr;
  }

  getImageBuffer(): Uint8Array {
    return new Uint8Array(0);
  }

  addEventListener(): void {
    return;
  }

  removeEventListener(): void {
    return;
  }

  dispatchEvent(): boolean {
    return false;
  }

  getStyle(): Record<string, unknown> {
    return {};
  }

  setStyle(): void {
    return;
  }

  getBoundingClientRect() {
    const rect = this.canvas?.nativeCanvas?.getBoundingClientRect?.();
    if (rect) {
      return rect;
    }
    return {
      left: 0,
      top: 0,
      right: this.width,
      bottom: this.height,
      width: this.width,
      height: this.height,
      x: 0,
      y: 0
    };
  }

  clearViewBox(): void {
    return;
  }
}

function configureNodeSmokeRuntime(): void {
  const bindingContext = getRuntimeInstallerBindingContext();

  bindingContext.rebind(EnvContribution).toConstantValue(new NodeSmokeEnvContribution());
  bindingContext
    .rebind(WindowHandlerContribution)
    .toConstantValue(new NodeSmokeWindowHandlerContribution())
    .whenTargetNamed(NODE_SMOKE_ENV);
  bindingContext
    .rebind(CanvasFactory)
    .toDynamicValue(() => (params: any) => new NodeSmokeCanvas(params))
    .whenTargetNamed(NODE_SMOKE_ENV);
  bindingContext
    .rebind(Context2dFactory)
    .toDynamicValue(() => (canvas: ICanvas) => canvas.getContext())
    .whenTargetNamed(NODE_SMOKE_ENV);

  bindingContext.rebind(StaticLayerHandlerContribution).toDynamicValue(() => new CanvasLayerHandlerContribution());
  bindingContext.rebind(DynamicLayerHandlerContribution).toDynamicValue(() => new OffscreenLayerHandlerContribution());
  bindingContext.rebind(VirtualLayerHandlerContribution).toDynamicValue(() => new EmptyLayerHandlerContribution());

  application.layerHandlerFactory = layerMode => {
    if (layerMode === 'static') {
      const handler = bindingContext.getAll(StaticLayerHandlerContribution)[0];
      if (!handler) {
        throw new Error('StaticLayerHandlerContribution is not configured for node smoke runtime.');
      }
      return handler as any;
    }
    if (layerMode === 'dynamic') {
      const handler = bindingContext.getAll(DynamicLayerHandlerContribution)[0];
      if (!handler) {
        throw new Error('DynamicLayerHandlerContribution is not configured for node smoke runtime.');
      }
      return handler as any;
    }
    const handler = bindingContext.getAll(VirtualLayerHandlerContribution)[0];
    if (!handler) {
      throw new Error('VirtualLayerHandlerContribution is not configured for node smoke runtime.');
    }
    return handler as any;
  };
  application.graphicService = application.graphicService ?? new DefaultGraphicService();
}

export function createNodeSmokeStage(params: Partial<IStageParams> = {}): IStage {
  const app = createNodeApp();

  configureNodeSmokeRuntime();
  configureRuntimeApplicationForApp(app);
  installRuntimeDrawContributionsToApp(app);
  installRuntimeGraphicRenderersToApp(app);
  getRuntimeInstallerGlobal().setEnv(NODE_SMOKE_ENV, { force: true } as any);

  const stage = app.createStage(params);
  const release = stage.release.bind(stage);
  let releasing = false;

  stage.release = () => {
    if (releasing) {
      return;
    }
    releasing = true;
    release();
    app.release();
  };

  return stage;
}
