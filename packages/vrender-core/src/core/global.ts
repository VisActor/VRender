import { inject, injectable, named } from '../common/inversify-lite';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ContributionProvider } from '../common/contribution-provider';
import type {
  CreateDOMParamsType,
  EnvType,
  IContributionProvider,
  ICreateCanvasParams,
  IEnvContribution,
  IEnvParamsMap,
  IGlobal,
  ISyncHook
} from '../interface';
import { SyncHook } from '../tapable';
import { EnvContribution } from '../constants';
import type { IAABBBoundsLike } from '@visactor/vutils';
import { container } from '../container';
import { Generator } from '../common/generator';
import { PerformanceRAF } from '../common/performance-raf';
import { EventListenerManager } from '../common/event-listener-manager';

const defaultEnv: EnvType = 'browser';
@injectable()
export class DefaultGlobal extends EventListenerManager implements IGlobal {
  readonly id: number;
  private _env: EnvType;
  private _isSafari?: boolean;
  private _isChrome?: boolean;
  private _isImageAnonymous?: boolean = true;
  private _performanceRAFList: PerformanceRAF[] = [];

  get env(): EnvType {
    return this._env;
  }
  private envContribution: IEnvContribution;

  get isImageAnonymous(): boolean {
    return this._isImageAnonymous;
  }

  set isImageAnonymous(isImageAnonymous: boolean) {
    this._isImageAnonymous = isImageAnonymous;
  }

  get devicePixelRatio(): number {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.getDevicePixelRatio();
  }

  get supportEvent(): boolean {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.supportEvent;
  }

  set supportEvent(support: boolean) {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    this.envContribution.supportEvent = support;
  }

  get supportsTouchEvents(): boolean {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.supportsTouchEvents;
  }

  set supportsTouchEvents(support: boolean) {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    this.envContribution.supportsTouchEvents = support;
  }

  get supportsPointerEvents(): boolean {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.supportsPointerEvents;
  }

  set supportsPointerEvents(support: boolean) {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    this.envContribution.supportsPointerEvents = support;
  }

  get supportsMouseEvents(): boolean {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.supportsMouseEvents;
  }

  set supportsMouseEvents(support: boolean) {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    this.envContribution.supportsMouseEvents = support;
  }

  get applyStyles(): boolean {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.applyStyles;
  }

  set applyStyles(support: boolean) {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    this.envContribution.applyStyles = support;
  }

  // 是否在不显示canvas的时候停止绘图操作，默认false
  optimizeVisible: boolean;

  envParams?: any;
  declare measureTextMethod: 'native' | 'simple' | 'quick';
  declare hooks: {
    onSetEnv: ISyncHook<[EnvType | undefined, EnvType, IGlobal]>;
  };

  // 事件监听器转换器，用于进行Event属性的转换，接收一个原生的Event，返回一个修改后的Event（默认不进行转换直接返回原始Event）
  // 注意返回的Event和原始的Event不是同一个对象，但也不能拷贝，返回的Event和原始Event是同一个Event类的实例（比如MouseEvent、FederatedPointerEvent等，不能直接拷贝或者用CustomEvent）
  eventListenerTransformer: (event: Event) => Event = event => event;

  constructor(
    // todo: 不需要创建，动态获取就行？
    @inject(ContributionProvider)
    @named(EnvContribution)
    protected readonly contributions: IContributionProvider<IEnvContribution>
  ) {
    super();
    this.id = Generator.GenAutoIncrementId();
    this.hooks = {
      onSetEnv: new SyncHook<[EnvType | undefined, EnvType, IGlobal]>(['lastEnv', 'env', 'global'])
    };
    this.measureTextMethod = 'native';
    this.optimizeVisible = false;
  }

  // Override from EventListenerManager
  protected _nativeAddEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.addEventListener(type, listener, options);
  }

  // Override from EventListenerManager
  protected _nativeRemoveEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.removeEventListener(type, listener, options);
  }

  // Override from EventListenerManager
  protected _nativeDispatchEvent(event: Event): boolean {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.dispatchEvent(event);
  }

  protected bindContribution(params?: any): void | Promise<any> {
    const promiseArr: any[] = [];
    this.contributions.getContributions().forEach(contribution => {
      const data = contribution.configure(this, params);
      if ((data as any) && (data as any).then) {
        promiseArr.push(data);
      }
    });
    if (promiseArr.length) {
      return Promise.all(promiseArr);
    }
  }

  /**
   * 获取动态canvas的数量，offscreenCanvas或者framebuffer
   */
  getDynamicCanvasCount(): number {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.getDynamicCanvasCount();
  }

  /**
   * 获取静态canvas的数量，纯粹canvas
   */
  getStaticCanvasCount(): number {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.getStaticCanvasCount();
  }

  /**
   * 设置当前环境
   * @param env
   * @param params 环境参数
   * 默认重复设置不生效，但如果params.force为true那么每次设置env都会重复执行初始化逻辑
   * @returns
   */
  setEnv(env: EnvType, params?: IEnvParamsMap[EnvType]): void | Promise<any> {
    // 如果环境设置过了，但是没有设置force为true，就直接跳过
    if (!(params && params.force === true) && this._env === env) {
      return;
    }
    this.deactiveCurrentEnv();
    return this.activeEnv(env, params);
  }

  protected deactiveCurrentEnv() {
    this.envContribution && this.envContribution.release();
  }

  protected activeEnv(env: EnvType, params?: IEnvParamsMap[EnvType]): void | Promise<any> {
    const lastEnv = this._env;
    this._env = env;
    const data = this.bindContribution(params);
    if (data && data.then) {
      return data.then(() => {
        this.envParams = params;
        this.hooks.onSetEnv.call(lastEnv, env, this);
      });
    }
    this.envParams = params;
    this.hooks.onSetEnv.call(lastEnv, env, this);
  }

  setActiveEnvContribution(contribution: IEnvContribution) {
    this.envContribution = contribution;
  }

  createCanvas(params: ICreateCanvasParams) {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.createCanvas(params);
  }

  createOffscreenCanvas(params: ICreateCanvasParams) {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.createOffscreenCanvas(params);
  }

  releaseCanvas(canvas: HTMLCanvasElement | string | any) {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.releaseCanvas(canvas);
  }

  getRequestAnimationFrame() {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.getRequestAnimationFrame();
  }

  /**
   * 获取特定的requestAnimationFrame，同一个id底层共用一个原生的requestAnimationFrame
   * @param id 唯一标识，用于区分不同的requestAnimationFrame，请使用数字，不要太大，因为底层使用的是数组索引
   */
  getSpecifiedRequestAnimationFrame(id: number) {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }

    // Check if PerformanceRAF instance exists for this id
    if (!this._performanceRAFList[id]) {
      this._performanceRAFList[id] = new PerformanceRAF();
    }

    const performanceRAF = this._performanceRAFList[id];

    // Return a function that adds the callback to the specific PerformanceRAF instance
    return (callback: FrameRequestCallback): number => {
      return performanceRAF.addAnimationFrameCb(callback);
    };
  }

  /**
   * 获取特定的cancelAnimationFrame，用于取消特定id的requestAnimationFrame
   * @param id
   */
  getSpecifiedCancelAnimationFrame(id: number) {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }

    // Return no-op if no PerformanceRAF instance exists for this id
    if (!this._performanceRAFList[id]) {
      return () => false;
    }

    const performanceRAF = this._performanceRAFList[id];

    // Return a function that removes the callback from the specific PerformanceRAF instance
    return (handle: number): boolean => {
      return performanceRAF.removeAnimationFrameCb(handle);
    };
  }

  getCancelAnimationFrame() {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.getCancelAnimationFrame();
  }

  getElementById(str: string): HTMLElement | null {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    if (!this.envContribution.getElementById) {
      return null;
    }
    return this.envContribution.getElementById(str);
  }

  getRootElement(): HTMLElement | null {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    if (!this.envContribution.getRootElement) {
      return null;
    }
    return this.envContribution.getRootElement();
  }

  getDocument(): Document | null {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    if (!this.envContribution.getDocument) {
      return null;
    }
    return this.envContribution.getDocument();
  }

  mapToCanvasPoint(event: any, domElement?: any) {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    if (!this.envContribution.mapToCanvasPoint) {
      return null;
    }
    return this.envContribution.mapToCanvasPoint(event, domElement);
  }

  loadImage(url: string) {
    if (!this._env) {
      this.setEnv('browser');
    }
    return this.envContribution.loadImage(url);
  }

  loadSvg(str: string) {
    if (!this._env) {
      this.setEnv('browser');
    }
    return this.envContribution.loadSvg(str);
  }

  loadJson(url: string) {
    if (!this._env) {
      this.setEnv('browser');
    }
    return this.envContribution.loadJson(url);
  }

  loadArrayBuffer(url: string) {
    if (!this._env) {
      this.setEnv('browser');
    }
    return this.envContribution.loadArrayBuffer(url);
  }

  loadBlob(url: string) {
    if (!this._env) {
      this.setEnv('browser');
    }
    return this.envContribution.loadBlob(url);
  }

  async loadFont(name: string, source: string | ArrayBuffer, descriptors?: FontFaceDescriptors) {
    if (!this._env) {
      this.setEnv('browser');
    }
    return this.envContribution.loadFont(name, source, descriptors);
  }

  isChrome(): boolean {
    if (this._isChrome != null) {
      return this._isChrome;
    }
    if (!this._env) {
      this.setEnv('browser');
    }
    this._isChrome = this._env === 'browser' && navigator.userAgent.indexOf('Chrome') > -1;
    return this._isChrome;
  }

  isSafari(): boolean {
    if (this._isSafari != null) {
      return this._isSafari;
    }
    if (!this._env) {
      this.setEnv('browser');
    }
    this._isSafari =
      this._env === 'browser' && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    return this._isSafari;
  }

  getNativeAABBBounds(dom: string | HTMLElement | any): IAABBBoundsLike {
    if (!this._env) {
      this.setEnv('browser');
    }
    return this.envContribution.getNativeAABBBounds(dom);
  }

  removeDom(dom: HTMLElement): boolean {
    if (!this._env) {
      this.setEnv('browser');
    }
    return this.envContribution.removeDom(dom);
  }

  createDom(params: CreateDOMParamsType): HTMLElement | null {
    if (!this._env) {
      this.setEnv('browser');
    }
    return this.envContribution.createDom(params);
  }

  updateDom(dom: HTMLElement, params: CreateDOMParamsType): boolean {
    if (!this._env) {
      this.setEnv('browser');
    }
    return this.envContribution.updateDom(dom, params);
  }

  getElementTop(dom: any, baseWindow: boolean = false): number {
    if (!this._env) {
      this.setEnv('browser');
    }
    return this.envContribution.getElementTop(dom, baseWindow);
  }
  getElementLeft(dom: any, baseWindow: boolean = false): number {
    if (!this._env) {
      this.setEnv('browser');
    }
    return this.envContribution.getElementLeft(dom, baseWindow);
  }
  getElementTopLeft(dom: any, baseWindow: boolean = false): { top: number; left: number } {
    if (!this._env) {
      this.setEnv('browser');
    }
    return this.envContribution.getElementTopLeft(dom, baseWindow);
  }

  isMacOS(): boolean {
    if (!this._env) {
      this.setEnv('browser');
    }
    return this.envContribution.isMacOS();
  }

  copyToClipBoard(text: string) {
    if (!this._env) {
      this.setEnv('browser');
    }
    return this.envContribution.copyToClipBoard(text);
  }
}
