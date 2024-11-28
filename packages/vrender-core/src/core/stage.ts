import type { IAABBBounds, IBounds, IBoundsLike, IMatrix } from '@visactor/vutils';
import { Bounds, Point, isString } from '@visactor/vutils';
import type {
  IGraphic,
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
  ILayerService,
  ITimeline,
  IOptimizeType,
  LayerMode,
  PickResult,
  IPlugin
} from '../interface';
import { VWindow } from './window';
import type { Layer } from './layer';
import { EventSystem } from '../event';
import { container } from '../container';
import { RenderService } from '../render';
import { Group } from '../graphic/group';
import { Theme } from '../graphic/theme';
import { PickerService } from '../picker/constants';
import { PluginService } from '../plugins/constants';
import { AutoRenderPlugin } from '../plugins/builtin-plugin/auto-render-plugin';
import { AutoRefreshPlugin } from '../plugins/builtin-plugin/auto-refresh-plugin';
import { IncrementalAutoRenderPlugin } from '../plugins/builtin-plugin/incremental-auto-render-plugin';
import { DirtyBoundsPlugin } from '../plugins/builtin-plugin/dirty-bounds-plugin';
import { defaultTicker } from '../animate/default-ticker';
import { SyncHook } from '../tapable';
import { LayerService } from './constants';
import { DefaultTimeline } from '../animate';
import { application } from '../application';
import { isBrowserEnv } from '../env-check';
import { Factory } from '../factory';

const DefaultConfig = {
  WIDTH: 500,
  HEIGHT: 500,
  X: 0,
  Y: 0,
  BACKGROUND: 'white'
};

type IStageState = 'rendering' | 'normal';

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

  declare state: IStageState;

  private _background: string | IColor;
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
    this.window.setViewBox(b);
  }
  get viewBox(): IAABBBounds {
    return this.window.getViewBox();
  }

  /**
   * @deprecated 不建议使用
   */
  get x(): number {
    return this.window.getViewBox().x1;
  }
  /**
   * @deprecated 不建议使用
   */
  set x(x: number) {
    const b = this.window.getViewBox();
    b.translate(x - b.x1, 0);
    this.window.setViewBox(b);
  }
  /**
   * @deprecated 不建议使用
   */
  get y(): number {
    return this.window.getViewBox().y1;
  }
  /**
   * @deprecated 不建议使用
   */
  set y(y: number) {
    const b = this.window.getViewBox();
    b.translate(0, y - b.y1);
    this.window.setViewBox(b);
  }
  get width(): number {
    return this.window.width;
  }
  set width(w: number) {
    this.resize(w, this.height);
  }
  get viewWidth(): number {
    return this.window.getViewBox().width();
  }
  set viewWidth(w: number) {
    this.resizeView(w, this.viewHeight);
  }
  get viewHeight(): number {
    return this.window.getViewBox().height();
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
  autoRefresh: boolean;
  _enableLayout: boolean;
  htmlAttribute: boolean | string | any;
  reactAttribute: boolean | string | any;
  increaseAutoRender: boolean;
  view3dTranform: boolean;
  readonly window: IWindow;
  private readonly global: IGlobal;
  readonly renderService: IRenderService;
  protected pickerService?: IPickerService;
  readonly pluginService: IPluginService;
  readonly layerService: ILayerService;
  private _eventSystem?: EventSystem;
  private get eventSystem(): EventSystem {
    return this._eventSystem;
  }

  protected _beforeRender?: (stage: IStage) => void;
  protected _afterRender?: (stage: IStage) => void;
  // 0: 正常渲染, > 0: 跳过隐藏canvas的渲染, < 0: 禁止渲染
  protected _skipRender?: number;
  protected _afterNextRenderCbs?: ((stage: IStage) => void)[];
  protected lastRenderparams?: Partial<IDrawContext>;

  protected interactiveLayer?: ILayer;
  protected supportInteractiveLayer: boolean;
  protected timeline: ITimeline;

  declare params: Partial<IStageParams>;

  // 是否在render之前执行了tick，如果没有执行，尝试执行tick用来应用动画属性，避免动画过程中随意赋值然后又调用同步render导致属性的突变
  // 第一次render不需要强行走动画
  protected tickedBeforeRender: boolean = true;

  /**
   * 所有属性都具有默认值。
   * Canvas为字符串或者Canvas元素，那么默认图层就会绑定到这个Canvas上
   * 如果不传入Canvas，那么会新建一个Canvas，用户可以通过Window模块管理这个Canvas
   * 1. 如果没有传入宽高，那么默认为canvas宽高，如果传入了宽高则stage使用传入宽高作为视口宽高
   * @param params
   */
  constructor(params: Partial<IStageParams> = {}) {
    super({});
    this.params = params;
    this.theme = new Theme();
    this.hooks = {
      beforeRender: new SyncHook(['stage']),
      afterRender: new SyncHook(['stage'])
    };
    this.global = application.global;
    if (!this.global.env && isBrowserEnv()) {
      // 如果是浏览器环境，默认设置env
      this.global.setEnv('browser');
    }
    this.window = container.get<IWindow>(VWindow);
    this.renderService = container.get<IRenderService>(RenderService);
    this.pluginService = container.get<IPluginService>(PluginService);
    this.layerService = container.get<ILayerService>(LayerService);
    this.pluginService.active(this, params);

    this.window.create({
      width: params.width,
      height: params.height,
      viewBox: params.viewBox,
      container: params.container,
      dpr: params.dpr || this.global.devicePixelRatio,
      canvasControled: params.canvasControled !== false,
      title: params.title || '',
      canvas: params.canvas
    });

    this.state = 'normal';
    this.renderCount = 0;
    this.tryInitEventSystem();
    // // 没有传入xy就默认为0
    // this._x = params.x ?? DefaultConfig.X;
    // this._y = params.y ?? DefaultConfig.Y;
    // // 没有传入view的宽高则默认为window的宽高
    // this._viewWidth = params.viewWidth ?? this.window.width;
    // this._viewHeight = params.viewHeight ?? this.window.height;
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

    // this.autoRender = params.autoRender;
    if (params.autoRender) {
      this.enableAutoRender();
    }
    if (params.autoRefresh) {
      this.enableAutoRefresh();
    }
    // 默认不开启dirtyBounds
    if (params.disableDirtyBounds === false) {
      this.enableDirtyBounds();
    }

    if (params.enableHtmlAttribute) {
      this.enableHtmlAttribute(params.enableHtmlAttribute);
    }
    if (params.ReactDOM) {
      this.enableReactAttribute(params.ReactDOM);
    }

    params.enableLayout && this.enableLayout();
    this.hooks.beforeRender.tap('constructor', this.beforeRender);
    this.hooks.afterRender.tap('constructor', this.afterRender);
    this._beforeRender = params.beforeRender;
    this._afterRender = params.afterRender;
    this.ticker = params.ticker || defaultTicker;
    this.supportInteractiveLayer = params.interactiveLayer !== false;
    this.timeline = new DefaultTimeline();
    this.ticker.addTimeline(this.timeline);
    this.timeline.pause();
    if (!params.optimize) {
      params.optimize = {};
    }
    this.optmize(params.optimize);
    // 如果背景是图片，触发加载图片操作
    if (params.background && isString(this._background) && this._background.includes('/')) {
      this.setAttributes({ background: this._background });
    }
    this.ticker.on('afterTick', this.afterTickCb);
  }

  pauseRender(sr: number = -1) {
    this._skipRender = sr;
  }

  resumeRender() {
    this._skipRender = 0;
  }

  protected tryInitEventSystem() {
    if (this.global.supportEvent && !this._eventSystem) {
      this._eventSystem = new EventSystem({
        targetElement: this.window,
        resolution: this.window.dpr || this.global.devicePixelRatio,
        rootNode: this as any,
        global: this.global,
        supportsPointerEvents: this.params.supportsPointerEvents,
        supportsTouchEvents: this.params.supportsTouchEvents,
        ...this.params.event
      });
    }
  }

  preventRender(prevent: boolean) {
    if (prevent) {
      this._skipRender = -Infinity;
    } else {
      // 判断是否需要outRange优化
      if (this.params.optimize.skipRenderWithOutRange !== false) {
        this._skipRender = this.window.isVisible() ? 0 : 1;
      } else {
        this._skipRender = 0;
      }
    }
  }

  // 优化策略
  optmize(params: IOptimizeType) {
    this.optmizeRender(params.skipRenderWithOutRange);
    this.params.optimize = params;
  }

  // 优化渲染
  protected optmizeRender(skipRenderWithOutRange: boolean = false) {
    if (!skipRenderWithOutRange) {
      return;
    }
    // 不在视口内的时候，跳过渲染
    this._skipRender = this._skipRender < 0 ? this._skipRender : this.window.isVisible() ? 0 : 1;
    this.window.onVisibleChange(this._onVisibleChange);
  }

  protected _onVisibleChange = (visible: boolean) => {
    if (this._skipRender < 0) {
      return;
    }
    if (visible) {
      if (this.dirtyBounds) {
        const b = this.window.getViewBox();
        this.dirtyBounds.setValue(b.x1, b.y1, b.width(), b.height());
      }
      if (this._skipRender > 1) {
        this.renderNextFrame();
      }
      this._skipRender = 0;
    } else {
      this._skipRender = 1;
    }
  };

  getTimeline() {
    return this.timeline;
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

    const DirectionalLight = Factory.getPlugin('DirectionalLight');

    if (DirectionalLight) {
      this.light = new DirectionalLight(dir, color, ambient);
    }
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
      const OrthoCamera = Factory.getPlugin('OrthoCamera');
      if (OrthoCamera) {
        this.camera = new OrthoCamera(cameraParams);
      }
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
    this.tickedBeforeRender = false;
  };

  protected afterTickCb = () => {
    this.tickedBeforeRender = true;
    // 性能模式不用立刻渲染
    if (this.params.optimize?.tickRenderMode === 'performance') {
      // do nothing
    } else {
      // 不是rendering的时候，render
      this.state !== 'rendering' && this.render();
    }
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
    const ViewTransform3dPlugin = Factory.getPlugin('ViewTransform3dPlugin');

    if (ViewTransform3dPlugin) {
      this.pluginService.register(new ViewTransform3dPlugin());
    }
  }

  disableView3dTranform() {
    if (!this.view3dTranform) {
      return;
    }
    this.view3dTranform = false;
    this.pluginService.findPluginsByName('ViewTransform3dPlugin').forEach(plugin => {
      this.pluginService.unRegister(plugin);
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
      this.pluginService.unRegister(plugin);
    });
  }
  enableAutoRefresh() {
    if (this.autoRefresh) {
      return;
    }
    this.autoRefresh = true;
    this.pluginService.register(new AutoRefreshPlugin());
  }
  disableAutoRefresh() {
    if (!this.autoRefresh) {
      return;
    }
    this.autoRefresh = false;
    this.pluginService.findPluginsByName('AutoRefreshPlugin').forEach(plugin => {
      this.pluginService.unRegister(plugin);
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
      this.pluginService.unRegister(plugin);
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
    } else {
      plugin.activate(this.pluginService);
    }
  }
  disableDirtyBounds() {
    if (!this.dirtyBounds) {
      return;
    }
    this.dirtyBounds = null;
    this.pluginService.findPluginsByName('DirtyBoundsPlugin').forEach(plugin => {
      this.pluginService.unRegister(plugin);
    });
  }
  enableLayout() {
    if (this._enableLayout) {
      return;
    }
    this._enableLayout = true;

    const FlexLayoutPlugin = Factory.getPlugin('FlexLayoutPlugin');

    if (FlexLayoutPlugin) {
      this.pluginService.register(new FlexLayoutPlugin());
    }
  }
  disableLayout() {
    if (!this._enableLayout) {
      return;
    }
    this._enableLayout = false;
    this.pluginService.findPluginsByName('FlexLayoutPlugin').forEach(plugin => {
      this.pluginService.unRegister(plugin);
    });
  }
  enableHtmlAttribute(container?: any) {
    if (this.htmlAttribute) {
      return;
    }
    const HtmlAttributePlugin = Factory.getPlugin('HtmlAttributePlugin');

    if (HtmlAttributePlugin) {
      this.htmlAttribute = container;
      this.pluginService.register(new HtmlAttributePlugin());
    }
  }
  disableHtmlAttribute() {
    if (!this.htmlAttribute) {
      return;
    }
    this.htmlAttribute = false;
    this.pluginService.findPluginsByName('HtmlAttributePlugin').forEach(plugin => {
      this.pluginService.unRegister(plugin);
    });
  }
  enableReactAttribute(container?: any) {
    if (this.reactAttribute) {
      return;
    }
    const ReactAttributePlugin = Factory.getPlugin('ReactAttributePlugin');

    if (ReactAttributePlugin) {
      this.reactAttribute = container;
      this.pluginService.register(new ReactAttributePlugin());
    }
  }
  disableReactAttribute() {
    if (!this.reactAttribute) {
      return;
    }
    this.reactAttribute = false;
    this.pluginService.findPluginsByName('ReactAttributePlugin').forEach(plugin => {
      this.pluginService.unRegister(plugin);
    });
  }

  getPluginsByName(name: string): IPlugin[] {
    return this.pluginService.findPluginsByName(name);
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

  protected tryUpdateAABBBounds(): IAABBBounds {
    const viewBox = this.window.getViewBox();
    this._AABBBounds.setValue(viewBox.x1, viewBox.y1, viewBox.x2, viewBox.y2);
    return this._AABBBounds;
  }

  combineLayer(ILayer1: ILayer, ILayer2: ILayer): ILayer {
    throw new Error('暂不支持');
  }
  // 如果传入CanvasId，如果存在相同Id，说明这两个图层使用相同的Canvas绘制
  // 但需要注意的是依然是两个图层（用于解决Table嵌入ChartSpace不影响Table的绘制）
  createLayer(canvasId?: string, layerMode?: LayerMode): ILayer {
    if (this.releaseStatus === 'released') {
      return;
    }
    // 创建一个默认layer图层
    const layer = this.layerService.createLayer(this, {
      main: false,
      layerMode,
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
  tryInitInteractiveLayer() {
    if (this.releaseStatus === 'released') {
      return;
    }
    // TODO：顺序可能会存在问题
    // 支持交互层，且没有创建过，那就创建
    if (this.supportInteractiveLayer && !this.interactiveLayer) {
      this.interactiveLayer = this.createLayer();
      this.interactiveLayer.name = '_builtin_interactive';
      this.interactiveLayer.attribute.pickable = false;
      this.nextFrameRenderLayerSet.add(this.interactiveLayer as any); // to be fixed
    }
    // this.interactiveLayer.afterDraw(l => {
    //   l.removeAllChild();
    // });
  }

  clearViewBox(color?: string) {
    this.window.clearViewBox(color);
  }

  render(layers?: ILayer[], params?: Partial<IDrawContext>): void {
    if (this.releaseStatus === 'released') {
      return;
    }
    this.ticker.start();
    this.timeline.resume();
    const state = this.state;
    this.state = 'rendering';
    // 判断是否需要手动执行tick
    if (!this.tickedBeforeRender) {
      this.ticker.trySyncTickStatus();
    }
    this.layerService.prepareStageLayer(this);
    if (!this._skipRender) {
      this.lastRenderparams = params;
      this.hooks.beforeRender.call(this);
      if (!this._skipRender) {
        this.renderLayerList(this.children as ILayer[]);
        this.combineLayersToWindow();
        this.nextFrameRenderLayerSet.clear();
      }
      this.hooks.afterRender.call(this);
    }
    this.state = state;
    this._skipRender && this._skipRender++;
  }

  protected combineLayersToWindow() {
    // TODO 后续支持通用的渲染模型
    if (this.global.env === 'harmony') {
      const ctx = this.window.getContext().nativeContext;
      this.forEachChildren<ILayer>((layer, i) => {
        if (i > 0) {
          const image = layer
            .getNativeHandler()
            .getContext()
            .canvas.nativeCanvas.nativeCanvas._c.transferToImageBitmap();
          ctx.transferFromImageBitmap(image);
        }
      });
    }
    return;
    // this.forEach<ILayer>((layer, i) => {
    //   layer.combineTo(this.window, {
    //     clear: i === 0,
    //     x: this.x,
    //     y: this.y,
    //     width: this.viewWidth,
    //     height: this.viewHeight,
    //     renderService: this.renderService,
    //     background: layer === this.defaultLayer ? this.background : undefined,
    //     updateBounds: !!this.dirtyBounds
    //   });
    // });
  }

  renderNextFrame(layers?: ILayer[], force?: boolean): void {
    // render状态中调用的不会触发nextFrame，避免loop
    // if (this.state === 'rendering' && !force) {
    //   console.log('abc');
    //   return;
    // }
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
    if (this.releaseStatus === 'released') {
      return;
    }
    this.timeline.resume();
    this.ticker.start();
    const state = this.state;
    this.state = 'rendering';
    this.layerService.prepareStageLayer(this);
    if (this.nextFrameRenderLayerSet.size && !this._skipRender) {
      this.hooks.beforeRender.call(this);
      if (!this._skipRender) {
        this.renderLayerList(Array.from(this.nextFrameRenderLayerSet.values()), this.lastRenderparams || {});
        this.combineLayersToWindow();
        this.nextFrameRenderLayerSet.clear();
      }
      this.hooks.afterRender.call(this);
    }
    this.state = state;
    this._skipRender && this._skipRender++;
  }

  protected renderLayerList(layerList: ILayer[], params?: Partial<IDrawContext>) {
    const list: ILayer[] = [];
    // 只需要render main layer即可
    for (let i = 0; i < layerList.length; i++) {
      let l = layerList[i];
      if (l.layerMode === 'virtual') {
        l = l.getNativeHandler().mainHandler.layer;
      }
      if (!list.includes(l)) {
        list.push(l);
      }
    }
    list.forEach(layer => {
      // 记录当前的stamp，避免重复绘制layer（如果存在virtual layer）
      if (layer.renderCount > this.renderCount) {
        return;
      }
      layer.renderCount = this.renderCount + 1;

      if (layer === this.interactiveLayer) {
        // 交互层由于其特殊性，不使用dirtyBounds
        this.dirtyBounds && this.dirtyBounds.clear();
      }
      layer.render(
        {
          renderService: this.renderService,
          background: layer === this.defaultLayer ? this.background : undefined,
          updateBounds: !!(this.dirtyBounds && !this.dirtyBounds.empty()),
          viewBox: this.window.getViewBox(),
          transMatrix: this.window.getViewBoxTransform()
        },
        { renderStyle: this.renderStyle, ...params }
      );
    });

    // 添加交互层渲染
    if (this.interactiveLayer && !layerList.includes(this.interactiveLayer)) {
      // 交互层由于其特殊性，不使用dirtyBounds
      this.dirtyBounds && this.dirtyBounds.clear();
      this.interactiveLayer.render(
        {
          renderService: this.renderService,
          updateBounds: !!(this.dirtyBounds && !this.dirtyBounds.empty()),
          viewBox: this.window.getViewBox(),
          transMatrix: this.window.getViewBoxTransform()
        },
        { renderStyle: this.renderStyle, ...params }
      );
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
    if (this.releaseStatus === 'released') {
      return;
    }
    // 如果不是子图的stage，那么认为用户也想要resize view
    if (!this.window.hasSubView()) {
      this.viewBox.setValue(this.viewBox.x1, this.viewBox.y1, this.viewBox.x1 + w, this.viewBox.y1 + h);
    }
    this.window.resize(w, h);
    this.forEachChildren<ILayer>(c => {
      c.resize(w, h);
    });
    // 设置camera
    // this.camera && (this.camera.params = { ...this.camera.params, right: this.width, bottom: this.height });
    this.camera && this.option3d && this.set3dOptions(this.option3d);
    rerender && this.render();
  }
  resizeView(w: number, h: number, rerender: boolean = true) {
    if (this.releaseStatus === 'released') {
      return;
    }
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
  setDpr(dpr: number, rerender: boolean = true): void {
    // this.window.setDpr(dpr);
    this.forEachChildren<ILayer>(c => {
      c.setDpr(dpr);
    });

    rerender && this.render();
  }
  setOrigin(x: number, y: number): void {
    throw new Error('暂不支持');
  }
  export(type: IExportType): HTMLCanvasElement | ImageData {
    throw new Error('暂不支持');
  }
  pick(x: number, y: number): PickResult | false {
    if (this.releaseStatus === 'released') {
      return;
    }
    // 暂时不提供layer的pick
    const result = this.getPickerService().pick(this.children as unknown as IGraphic[], new Point(x, y), {
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

    this.hooks.beforeRender.unTap('constructor', this.beforeRender);
    this.hooks.afterRender.unTap('constructor', this.afterRender);

    this.eventSystem && this.eventSystem.release();
    this.layerService.releaseStage(this);
    this.pluginService.release();
    this.forEach(layer => {
      layer.release();
    });
    // 额外删除掉interactiveLayer的节点
    if (this.interactiveLayer) {
      this.interactiveLayer.forEachChildren((item: IGraphic) => {
        item.setStage && item.setStage(null, null);
        this.interactiveLayer.removeChild(item);
      });
      this.interactiveLayer.release();
    }
    this.window.release();
    this.ticker.remTimeline(this.timeline);
    this.ticker.removeListener('afterTick', this.afterTickCb);
    this.renderService.renderTreeRoots = [];
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
    if (this.releaseStatus === 'released') {
      return;
    }
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

  renderTo(window: IWindow) {
    if (this.releaseStatus === 'released') {
      return;
    }
    this.forEachChildren<ILayer>((layer, i) => {
      layer.drawTo(window, {
        // ...params,
        renderService: this.renderService,
        viewBox: window.getViewBox(),
        transMatrix: window.getViewBoxTransform(),
        background: layer === this.defaultLayer ? this.background : undefined,
        clear: i === 0, // 第一个layer需要clear
        updateBounds: !!(this.dirtyBounds && !this.dirtyBounds.empty())
      });
    });
  }

  /**
   * 渲染到新的window上去
   * @param fullImage 是否是全量的image，因为可能之前的window有一部分场景树超过window的帧缓冲了
   * @returns
   */
  renderToNewWindow(fullImage: boolean = true, viewBox?: IAABBBounds): IWindow {
    if (this.releaseStatus === 'released') {
      return;
    }
    const window = container.get<IWindow>(VWindow);
    const x1 = viewBox ? -viewBox.x1 : 0;
    const y1 = viewBox ? -viewBox.y1 : 0;
    const x2 = viewBox ? viewBox.x2 : this.viewWidth;
    const y2 = viewBox ? viewBox.y2 : this.viewHeight;
    const width = viewBox ? viewBox.width() : this.viewWidth;
    const height = viewBox ? viewBox.height() : this.viewHeight;
    if (fullImage) {
      window.create({
        viewBox: { x1, y1, x2, y2 },
        width,
        height,
        dpr: this.window.dpr,
        canvasControled: true,
        offscreen: true,
        title: ''
      });
    } else {
      window.create({
        viewBox: { x1, y1, x2, y2 },
        width,
        height,
        dpr: this.window.dpr,
        canvasControled: true,
        offscreen: true,
        title: ''
      });
    }

    this.renderTo(window);
    return window;
  }

  toCanvas(fullImage: boolean = true, viewBox?: IAABBBounds): HTMLCanvasElement | null {
    if (this.releaseStatus === 'released') {
      return;
    }
    const window = this.renderToNewWindow(fullImage, viewBox);
    const c = window.getNativeHandler();
    if (c.nativeCanvas) {
      return c.nativeCanvas;
    }
    return null;
  }

  setCursor(mode?: string): void {
    this._cursor = mode;
    this.eventSystem.setCursor(mode, 'ignore');
  }

  getCursor() {
    return this._cursor;
  }

  eventPointTransform(e: PointerEvent | WheelEvent | TouchEvent): { x: number; y: number } {
    const point = this.global.mapToCanvasPoint(e, this.window.getContext().canvas.nativeCanvas);

    return this.stage.window.pointTransform(point.x, point.y);
  }

  pauseTriggerEvent() {
    this._eventSystem && this._eventSystem.pauseTriggerEvent();
  }
  resumeTriggerEvent() {
    this._eventSystem && this._eventSystem.resumeTriggerEvent();
  }

  getPickerService() {
    if (!this.pickerService) {
      this.pickerService = container.get<IPickerService>(PickerService);
    }
    return this.pickerService;
  }
}
