import type { IBounds, IBoundsLike, IMatrix } from '@visactor/vutils';
import { AABBBounds, Bounds, Point } from '@visactor/vutils';
import type {
  IGraphic,
  IGroup,
  IExportType,
  IStage,
  IStageParams,
  ILayer,
  IColor,
  IGlobal,
  IOption3D,
  ICamera,
  vec3,
  IDirectionLight,
  ITicker,
  IRenderService,
  IPickerService,
  IPluginService,
  ISyncHook,
  IDrawContext,
  IWindow,
  IPlugin,
  IContributionProvider,
  ILayerService
} from '../interface';
import { Window } from './window';
import type { Layer } from './layer';
import { EventSystem } from '../event';
import { container } from '../container';
import { RenderService } from '../render';
import { Group, Theme } from '../graphic';
import { PickerService } from '../picker/picker-service';
import { PluginService } from '../plugins/constants';
import { AutoRenderPlugin } from '../plugins/builtin-plugin/auto-render-plugin';
import { ViewTransform3dPlugin } from '../plugins/builtin-plugin/3dview-transform-plugin';
import { IncrementalAutoRenderPlugin } from '../plugins/builtin-plugin/incremental-auto-render-plugin';
import { DirtyBoundsPlugin } from '../plugins/builtin-plugin/dirty-bounds-plugin';
import { defaultTicker } from '../animate/default-ticker';
import { SyncHook } from '../tapable';
import { DirectionalLight } from './light';
import { OrthoCamera } from './camera';
import { Global } from '../constants';
import { LayerService } from './constants';

const DefaultConfig = {
  WIDTH: 500,
  HEIGHT: 500,
  X: 0,
  Y: 0,
  BACKGROUND: 'white'
};

/**
 * Stage是一个舞台或一个视口，并不直接对应一个或多个Canvas，逻辑上和Canvas无关
 *
 * 1. Stage对应一个Canvas的整体，Stage的宽高即为Canvas的宽高
 * 2. Stage小于Canvas，Stage作为Canvas某个区域的视口，只管理这个区域
 * 3. 多图层时Stage的多个图层对应多个Canvas
 *
 * 原生环境下Stage可以拥有一个Window或者使用Window的一块区域
 *
 * 【注】如果希望获取完整的Canvas或窗口或者调整窗口信息，请使用Window模块
 */
export class Stage extends Group implements IStage {
  declare parent: IStage | null;

  // protected _x: number;
  // protected _y: number;
  // // 窗口的宽高
  // private _width: number;
  // private _height: number;
  // 视口的宽高
  // private _viewWidth: number;
  // private _viewHeight: number;
  protected _viewBox: AABBBounds;
  private _background: string | IColor;
  private _subView: boolean; // 是否是存在子视图
  protected nextFrameRenderLayerSet: Set<Layer>;
  protected willNextFrameRender: boolean;
  protected _cursor: string;
  renderCount: number;
  dirtyBounds: IBounds | null;
  option3d?: IOption3D;
  declare light?: IDirectionLight;
  declare camera?: ICamera;
  declare renderStyle?: string;

  declare hooks: {
    beforeRender: ISyncHook<[IStage]>;
    afterRender: ISyncHook<[IStage]>;
  };

  set viewBox(b: IBoundsLike) {
    this._viewBox.setValue(b.x1, b.y1, b.x2, b.y2);
  }
  get viewBox(): AABBBounds {
    return this._viewBox;
  }

  get x(): number {
    return this._viewBox.x1;
  }
  set x(x: number) {
    this._viewBox.translate(x - this._viewBox.x1, 0);
  }
  get y(): number {
    return this._viewBox.y1;
  }
  set y(y: number) {
    this._viewBox.translate(0, y - this._viewBox.y1);
  }
  get width(): number {
    return this.window.width;
  }
  set width(w: number) {
    this.resize(w, this.height);
  }
  get viewWidth(): number {
    return this._viewBox.width();
  }
  set viewWidth(w: number) {
    this.resizeView(w, this.viewHeight);
  }
  get viewHeight(): number {
    return this._viewBox.height();
  }
  set viewHeight(h: number) {
    this.resizeView(this.viewWidth, h);
  }
  get height(): number {
    return this.window.height;
  }
  set height(h: number) {
    this.resize(this.width, h);
  }
  get dpr(): number {
    return this.window.dpr;
  }
  set dpr(r: number) {
    this.setDpr(r);
  }
  get background(): string | IColor {
    return this._background ?? DefaultConfig.BACKGROUND;
  }
  set background(b: string | IColor) {
    this._background = b;
  }
  get defaultLayer(): ILayer {
    return this.at(0) as unknown as ILayer;
  }

  ticker: ITicker;

  autoRender: boolean;
  increaseAutoRender: boolean;
  view3dTranform: boolean;
  readonly window: IWindow;
  private readonly global: IGlobal;
  readonly renderService: IRenderService;
  readonly pickerService: IPickerService;
  readonly pluginService: IPluginService;
  readonly layerService: ILayerService;
  private readonly eventSystem?: EventSystem;

  protected _beforeRender?: (stage: IStage) => void;
  protected _afterRender?: (stage: IStage) => void;
  protected _afterNextRenderCbs?: ((stage: IStage) => void)[];
  protected lastRenderparams?: Partial<IDrawContext>;

  protected interactiveLayer?: ILayer;

  /**
   * 所有属性都具有默认值。
   * Canvas为字符串或者Canvas元素，那么默认图层就会绑定到这个Canvas上
   * 如果不传入Canvas，那么会新建一个Canvas，用户可以通过Window模块管理这个Canvas
   * 1. 如果没有传入宽高，那么默认为canvas宽高，如果传入了宽高则stage使用传入宽高作为视口宽高
   * @param params
   */
  constructor(params: Partial<IStageParams>) {
    super({});
    this.theme = new Theme();
    this.hooks = {
      beforeRender: new SyncHook(['stage']),
      afterRender: new SyncHook(['stage'])
    };
    this.global = container.get<IGlobal>(Global);
    this.window = container.get<IWindow>(Window);
    this.renderService = container.get<IRenderService>(RenderService);
    this.pickerService = container.get<IPickerService>(PickerService);
    this.pluginService = container.get<IPluginService>(PluginService);
    this.layerService = container.get<ILayerService>(LayerService);
    this.pluginService.active(this, params);

    this.window.create({
      width: params.width,
      height: params.height,
      container: params.container,
      dpr: params.dpr || this.global.devicePixelRatio,
      canvasControled: params.canvasControled !== false,
      title: params.title || '',
      canvas: params.canvas
    });

    this._viewBox = new AABBBounds();
    if (params.viewBox) {
      this._viewBox.setValue(params.viewBox.x1, params.viewBox.y1, params.viewBox.x2, params.viewBox.y2);
    } else {
      this._viewBox.setValue(0, 0, this.width, this.height);
    }

    this.renderCount = 0;

    // // 没有传入xy就默认为0
    // this._x = params.x ?? DefaultConfig.X;
    // this._y = params.y ?? DefaultConfig.Y;
    // // 没有传入view的宽高则默认为window的宽高
    // this._viewWidth = params.viewWidth ?? this.window.width;
    // this._viewHeight = params.viewHeight ?? this.window.height;
    this._subView = !(this._viewBox.width() === this.width && this._viewBox.height() === this.height);
    // this._AABBBounds.set(this._x, this._y, this._viewWidth + this._x, this._viewHeight + this._y);
    // 背景色默认为纯白色
    this._background = params.background ?? DefaultConfig.BACKGROUND;

    // 创建一个默认layer图层
    // this.appendChild(new Layer(this, this.global, this.window, { main: true }));
    this.appendChild(this.layerService.createLayer(this, { main: true }));

    this.nextFrameRenderLayerSet = new Set();
    this.willNextFrameRender = false;
    this.stage = this;
    this.renderStyle = params.renderStyle;

    if (this.global.supportEvent) {
      this.eventSystem = new EventSystem({
        targetElement: this.window,
        resolution: this.window.dpr || this.global.devicePixelRatio,
        rootNode: this as any,
        global: this.global,
        viewport: {
          viewBox: this._viewBox,
          get x(): number {
            return this.viewBox.x1;
          },
          get y(): number {
            return this.viewBox.y1;
          },
          get width(): number {
            return this.viewBox.width();
          },
          get height(): number {
            return this.viewBox.height();
          }
        }
      });
    }

    // this.autoRender = params.autoRender;
    if (params.autoRender) {
      this.enableAutoRender();
    }
    // 默认不开启dirtyBounds
    if (params.disableDirtyBounds === false) {
      this.enableDirtyBounds();
    }
    this.hooks.beforeRender.tap('constructor', this.beforeRender);
    this.hooks.afterRender.tap('constructor', this.afterRender);
    this._beforeRender = params.beforeRender;
    this._afterRender = params.afterRender;
    this.ticker = params.ticker || defaultTicker;
    if (params.interactiveLayer !== false) {
      this.initInteractiveLayer();
    }
  }

  get3dOptions(options: IOption3D) {
    const {
      center = { x: this.width / 2, y: this.height / 2, z: 0, dx: 0, dy: 0, dz: 0 },
      light = {},
      alpha = 0,
      beta = 0,
      camera,
      fieldRatio = 1,
      fieldDepth
    } = options;

    return {
      ...options,
      center,
      light,
      alpha,
      beta,
      camera,
      fieldRatio,
      fieldDepth
    };
  }

  set3dOptions(options: IOption3D) {
    this.option3d = options;
    const options3d = this.get3dOptions(options);
    const { light, center, camera, alpha, beta, fieldRatio, fieldDepth } = options3d;
    const { dir = [1, 1, -1], color = 'white', ambient } = light;

    const centerX = (center.x ?? this.width / 2) + (center.dx ?? 0);
    const centerY = (center.y ?? this.height / 2) + (center.dy ?? 0);
    const centerZ = (center.z ?? 0) + (center.dz ?? 0);
    const centerVec3: vec3 = [centerX, centerY, centerZ];
    const z = 1;
    let cameraX = 0;
    let cameraY = 0;
    let cameraZ = 0;
    if (!camera) {
      cameraX = Math.sin(alpha) + centerX;
      cameraY = Math.sin(beta) + centerY;
      cameraZ = Math.cos(alpha) * Math.cos(beta) * z;
    }

    this.light = new DirectionalLight(dir, color, ambient);
    const cameraParams = {
      left: 0,
      right: this.width,
      top: 0,
      bottom: this.height,
      fieldRatio: fieldRatio,
      fieldDepth,
      viewParams: {
        pos: [cameraX, cameraY, cameraZ] as vec3,
        center: centerVec3,
        up: [0, 1, 0] as vec3
      }
    };
    if (this.camera) {
      this.camera.params = cameraParams;
    } else {
      this.camera = new OrthoCamera(cameraParams);
    }

    if (options.enableView3dTransform) {
      this.enableView3dTransform();
    }
  }

  protected beforeRender = (stage: IStage) => {
    this._beforeRender && this._beforeRender(stage);
  };

  protected afterRender = (stage: IStage) => {
    this.renderCount++;
    this._afterRender && this._afterRender(stage);
    this._afterNextRenderCbs && this._afterNextRenderCbs.forEach(cb => cb(stage));
    this._afterNextRenderCbs = null;
  };

  setBeforeRender(cb: (stage: IStage) => void) {
    this._beforeRender = cb;
  }

  setAfterRender(cb: (stage: IStage) => void) {
    this._afterRender = cb;
  }

  afterNextRender(cb: (stage: IStage) => void) {
    if (!this._afterNextRenderCbs) {
      this._afterNextRenderCbs = [];
    }
    this._afterNextRenderCbs.push(cb);
  }

  enableView3dTransform() {
    if (this.view3dTranform) {
      return;
    }
    this.view3dTranform = true;
    this.pluginService.register(new ViewTransform3dPlugin());
  }

  disableView3dTranform() {
    if (!this.view3dTranform) {
      return;
    }
    this.view3dTranform = false;
    this.pluginService.findPluginsByName('ViewTransform3dPlugin').forEach(plugin => {
      plugin.deactivate(this.pluginService);
    });
  }

  enableAutoRender() {
    if (this.autoRender) {
      return;
    }
    this.autoRender = true;
    this.pluginService.register(new AutoRenderPlugin());
  }
  disableAutoRender() {
    if (!this.autoRender) {
      return;
    }
    this.autoRender = false;
    this.pluginService.findPluginsByName('AutoRenderPlugin').forEach(plugin => {
      plugin.deactivate(this.pluginService);
    });
  }
  enableIncrementalAutoRender() {
    if (this.increaseAutoRender) {
      return;
    }
    this.increaseAutoRender = true;
    this.pluginService.register(new IncrementalAutoRenderPlugin());
  }
  disableIncrementalAutoRender() {
    if (!this.increaseAutoRender) {
      return;
    }
    this.increaseAutoRender = false;
    this.pluginService.findPluginsByName('IncrementalAutoRenderPlugin').forEach(plugin => {
      plugin.deactivate(this.pluginService);
    });
  }
  enableDirtyBounds() {
    if (this.dirtyBounds) {
      return;
    }
    this.dirtyBounds = new Bounds();
    let plugin = this.pluginService.findPluginsByName('DirtyBoundsPlugin')[0];
    if (!plugin) {
      plugin = new DirtyBoundsPlugin();
      this.pluginService.register(plugin);
    }
    plugin.activate(this.pluginService);
  }
  disableDirtyBounds() {
    if (!this.dirtyBounds) {
      return;
    }
    this.dirtyBounds = null;
    this.pluginService.findPluginsByName('DirtyBoundsPlugin').forEach(plugin => {
      plugin.deactivate(this.pluginService);
    });
  }

  // /**
  //  * stage的appendChild，add
  //  * @param node
  //  * @returns
  //  */
  // appendChild<T extends Node>(node: T): T | null {
  //   const layer = this.at(0);
  //   if (!layer) {
  //     return null;
  //   }
  //   return layer.appendChild<T>(node);
  // }

  protected tryUpdateAABBBounds(): AABBBounds {
    const viewBox = this._viewBox;
    this._AABBBounds.setValue(viewBox.x1, viewBox.y1, viewBox.x2, viewBox.y2);
    return this._AABBBounds;
  }

  combineLayer(ILayer1: ILayer, ILayer2: ILayer): ILayer {
    throw new Error('暂不支持');
  }
  // 如果传入CanvasId，如果存在相同Id，说明这两个图层使用相同的Canvas绘制
  // 但需要注意的是依然是两个图层（用于解决Table嵌入ChartSpace不影响Table的绘制）
  createLayer(canvasId?: string): ILayer {
    // 创建一个默认layer图层
    const layer = this.layerService.createLayer(this, {
      main: false,
      canvasId
    });
    this.appendChild(layer);
    return layer;
    // const layer = new Layer(this, this.global, this.window, {
    //   main: false,
    //   canvasId
    // });
    // this.appendChild(layer);
    // return layer;
  }
  sortLayer(cb: (ILayer1: ILayer, layer2: ILayer) => number): void {
    const children = this.children;
    children.sort(cb);
    this.removeAllChild();
    children.forEach(c => {
      this.appendChild(c);
    });
  }
  removeLayer(ILayerId: number): ILayer | false {
    return this.removeChild(this.findChildByUid(ILayerId) as IGraphic) as ILayer;
  }
  protected initInteractiveLayer() {
    // TODO：顺序可能会存在问题
    this.interactiveLayer = this.createLayer();
    this.interactiveLayer.name = '_builtin_interactive';
    // this.interactiveLayer.afterDraw(l => {
    //   l.removeAllChild();
    // });
  }

  clearViewBox(color?: string) {
    this.window.clearViewBox(this._viewBox, color);
  }

  render(layers?: ILayer[], params?: Partial<IDrawContext>): void {
    this.ticker.start();
    this.lastRenderparams = params;
    this.hooks.beforeRender.call(this);
    (layers || this).forEach<ILayer>((layer, i) => {
      layer.render(
        {
          renderService: this.renderService,
          background: layer === this.defaultLayer ? this.background : undefined,
          updateBounds: !!this.dirtyBounds
        },
        { renderStyle: this.renderStyle, ...params }
      );
    });
    this.combineLayersToWindow();
    this.nextFrameRenderLayerSet.clear();
    this.hooks.afterRender.call(this);
  }

  protected combineLayersToWindow() {
    this.forEach<ILayer>((layer, i) => {
      layer.combineTo(this.window, {
        clear: i === 0,
        x: this.x,
        y: this.y,
        width: this.viewWidth,
        height: this.viewHeight,
        renderService: this.renderService,
        background: layer === this.defaultLayer ? this.background : undefined,
        updateBounds: !!this.dirtyBounds
      });
    });
  }

  renderNextFrame(layers?: ILayer[]): void {
    // 性能优化，避免重复add
    if (this.nextFrameRenderLayerSet.size !== this.childrenCount) {
      (layers || this).forEach<ILayer>((layer: any) => {
        this.nextFrameRenderLayerSet.add(layer);
      });
    }
    if (!this.willNextFrameRender) {
      this.willNextFrameRender = true;
      this.global.getRequestAnimationFrame()(() => {
        this._doRenderInThisFrame(), (this.willNextFrameRender = false);
      });
    }
  }

  _doRenderInThisFrame() {
    if (this.nextFrameRenderLayerSet.size) {
      this.ticker.start();
      this.hooks.beforeRender.call(this);
      this.forEach((layer: Layer) => {
        if (this.nextFrameRenderLayerSet.has(layer)) {
          layer.render(
            {
              renderService: this.renderService,
              background: layer === this.defaultLayer ? this.background : undefined,
              updateBounds: !!this.dirtyBounds
            },
            { renderStyle: this.renderStyle, ...(this.lastRenderparams || {}) }
          );
        }
      });
      this.combineLayersToWindow();
      this.hooks.afterRender.call(this);
      this.nextFrameRenderLayerSet.clear();
    }
  }

  resizeWindow(w: number, h: number, rerender: boolean = true) {
    this.window.resize(w, h);
    rerender && this.render();
  }

  /**
   * 语法糖，如果viewBox和window宽高一样的话，那么会同时缩放window和viewBox
   * @param w
   * @param h
   * @param rerender
   */
  resize(w: number, h: number, rerender: boolean = true): void {
    this.window.resize(w, h);
    this.forEachChildren<ILayer>(c => {
      c.resize(w, h);
    });
    // 如果不是子图的stage，那么认为用户也想要resize view
    if (!this._subView) {
      this.viewBox.setValue(this.viewBox.x1, this.viewBox.y1, this.viewBox.x1 + w, this.viewBox.y1 + h);
    }
    // 设置camera
    // this.camera && (this.camera.params = { ...this.camera.params, right: this.width, bottom: this.height });
    this.camera && this.option3d && this.set3dOptions(this.option3d);
    rerender && this.render();
  }
  resizeView(w: number, h: number, rerender: boolean = true) {
    this.viewBox.setValue(this.viewBox.x1, this.viewBox.y1, this.viewBox.x1 + w, this.viewBox.y1 + h);
    this.forEachChildren<ILayer>(c => {
      c.resizeView(w, h);
    });
    // 设置camera
    this.camera && (this.camera.params = { ...this.camera.params, right: this.width, bottom: this.height });
    rerender && this.render();
  }
  setViewBox(viewBox: IBoundsLike, rerender: boolean): void;
  setViewBox(x: number, y: number, w: number, h: number, rerender: boolean): void;
  setViewBox(x: number | IBoundsLike, y: number | boolean, w?: number, h?: number, rerender?: boolean): void {
    let isRerender: boolean = true;

    if (typeof x === 'object') {
      this.viewBox.setValue(x.x1, x.y1, x.x2, x.y2);
      if (y === false) {
        isRerender = false;
      }
    } else {
      this.viewBox.setValue(x, y as number, x + w, (y as number) + h);

      if (rerender === false) {
        isRerender = false;
      }
    }

    this.forEachChildren<ILayer>(c => {
      c.resizeView(this.viewBox.width(), this.viewBox.height());
    });
    isRerender && this.render();
  }
  setDpr(dpr: number): void {
    // this.window.setDpr(dpr);
    this.forEachChildren<ILayer>(c => {
      c.setDpr(dpr);
    });
  }
  setOrigin(x: number, y: number): void {
    throw new Error('暂不支持');
  }
  export(type: IExportType): HTMLCanvasElement | ImageData {
    throw new Error('暂不支持');
  }
  pick(x: number, y: number): { graphic: IGraphic | null; group: IGroup | null } | false {
    // 暂时不提供layer的pick
    const result = this.pickerService.pick(this.children as unknown as IGraphic[], new Point(x, y), {
      bounds: this.AABBBounds
    });
    if (result?.graphic || result?.group) {
      return result;
    }
    return false;
  }

  // 动画相关
  startAnimate(t: number): void {
    throw new Error('暂不支持');
  }
  setToFrame(t: number): void {
    throw new Error('暂不支持');
  }

  release() {
    super.release();
    this.eventSystem && this.eventSystem.release();
    this.pluginService.release();
    this.forEach(layer => {
      layer.release();
    });
    this.interactiveLayer && this.interactiveLayer.release();
    this.window.release();
  }

  setStage(stage?: IStage) {
    return;
    // this.stage = this;
    // this.forEachChildren(item => {
    //   (item as Layer).setStage(this);
    // });
  }

  /**
   * 添加dirty区域，会修改参数b
   * @param b
   * @param matrix
   */
  dirty(b: IBounds, matrix?: IMatrix) {
    if (matrix) {
      b.transformWithMatrix(matrix);
    }
    if (this.dirtyBounds.empty()) {
      this.dirtyBounds.setValue(b.x1, b.y1, b.x2, b.y2);
    }
    this.dirtyBounds.union(b);
  }

  getLayer(name: string): undefined | ILayer {
    const layer = this.children.filter(layer => layer.name === name);
    return layer[0] as ILayer;
  }

  renderTo(window: IWindow, params: { x: number; y: number; width: number; height: number }) {
    this.forEachChildren<ILayer>((layer, i) => {
      layer.drawTo(window, {
        ...params,
        renderService: this.renderService,
        background: layer === this.defaultLayer ? this.background : undefined,
        clear: i === 0, // 第一个layer需要clear
        updateBounds: !!this.dirtyBounds
      });
    });
  }

  /**
   * 渲染到新的window上去
   * @param fullImage 是否是全量的image，因为可能之前的window有一部分场景树超过window的帧缓冲了
   * @returns
   */
  renderToNewWindow(fullImage: boolean = true): IWindow {
    const window = container.get<IWindow>(Window);
    if (fullImage) {
      window.create({
        width: this.viewWidth,
        height: this.viewHeight,
        dpr: this.window.dpr,
        canvasControled: true,
        offscreen: true,
        title: ''
      });
    } else {
      window.create({
        width: Math.min(this.viewWidth, this.window.width - this.x),
        height: Math.min(this.viewHeight, this.window.height - this.y),
        dpr: this.window.dpr,
        canvasControled: true,
        offscreen: true,
        title: ''
      });
    }

    this.renderTo(window, {
      x: 0,
      y: 0,
      width: window.width,
      height: window.height
    });
    return window;
  }

  toCanvas(fullImage: boolean = true): HTMLCanvasElement | null {
    const window = this.renderToNewWindow(fullImage);
    const c = window.getNativeHandler();
    if (c.nativeCanvas) {
      return c.nativeCanvas;
    }
    return null;
  }

  setCursor(mode?: string): void {
    this._cursor = mode;
    this.eventSystem.setCursor(mode);
  }

  getCursor() {
    return this._cursor;
  }
}
