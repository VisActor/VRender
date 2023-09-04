import { inject, injectable, named } from 'inversify';
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

const defaultEnv: EnvType = 'browser';
@injectable()
export class DefaultGlobal implements IGlobal {
  private _env: EnvType;
  get env(): EnvType {
    return this._env;
  }
  private envContribution: IEnvContribution;

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

  get supportsTouchEvents(): boolean {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.supportsTouchEvents;
  }

  get supportsPointerEvents(): boolean {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.supportsPointerEvents;
  }

  get supportsMouseEvents(): boolean {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.supportsMouseEvents;
  }

  get applyStyles(): boolean {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.applyStyles;
  }

  envParams?: any;
  declare measureTextMethod: 'native' | 'simple' | 'quick';
  declare hooks: {
    onSetEnv: ISyncHook<[EnvType | undefined, EnvType, IGlobal]>;
  };

  constructor(
    // todo: 不需要创建，动态获取就行？
    @inject(ContributionProvider)
    @named(EnvContribution)
    protected readonly contributions: IContributionProvider<IEnvContribution>
  ) {
    this.hooks = {
      onSetEnv: new SyncHook<[EnvType | undefined, EnvType, IGlobal]>(['lastEnv', 'env', 'global'])
    };
    this.measureTextMethod = 'native';
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

  addEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.addEventListener(type, listener, options);
  }
  removeEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.removeEventListener(type, listener, options);
  }
  dispatchEvent(event: any): boolean {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.dispatchEvent(event);
  }

  getRequestAnimationFrame() {
    if (!this._env) {
      this.setEnv(defaultEnv);
    }
    return this.envContribution.getRequestAnimationFrame();
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

  isChrome(): boolean {
    if (!this._env) {
      this.setEnv('browser');
    }
    return this._env === 'browser' && navigator.userAgent.indexOf('Chrome') > -1;
  }

  isSafari(): boolean {
    if (!this._env) {
      this.setEnv('browser');
    }
    return this._env === 'browser' && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
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
}
