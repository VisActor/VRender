import { epsilon } from '@visactor/vutils';
import { ITimeline } from '../../animate';
import { Releaseable } from '../../interface';
import { global } from '../../modules';
import { ITicker } from './interface';

export class ManualTickHandler implements ITickHandler {
  protected timerId: number;
  protected time: number = 0;

  static Avaliable(): boolean {
    return true;
  }

  avaliable(): boolean {
    return ManualTickHandler.Avaliable();
  }

  tick(interval: number, cb: (handler: ITickHandler, params?: { once: boolean }) => void): void {
    this.time = Math.max(0, interval + this.time);
    cb(this, { once: true });
  }

  tickTo(t: number, cb: (handler: ITickHandler, params?: { once: boolean }) => void): void {
    this.time = Math.max(0, t);
    cb(this, { once: true });
  }

  release() {
    if (this.timerId > 0) {
      // clearTimeout(this.timerId);
      this.timerId = -1;
    }
  }

  getTime() {
    return this.time;
  }
}

export class TimeOutTickHandler implements ITickHandler {
  protected timerId: number;

  static Avaliable(): boolean {
    return true;
  }

  avaliable(): boolean {
    return TimeOutTickHandler.Avaliable();
  }

  tick(interval: number, cb: (handler: ITickHandler) => void): void {
    this.timerId = setTimeout(() => {
      cb(this);
    }, interval) as unknown as number;
  }

  release() {
    if (this.timerId > 0) {
      clearTimeout(this.timerId);
      this.timerId = -1;
    }
  }
  getTime() {
    return Date.now();
  }
}

export class RAFTickHandler implements ITickHandler {
  protected released: boolean;

  static Avaliable(): boolean {
    return !!global.getRequestAnimationFrame();
  }
  avaliable(): boolean {
    return RAFTickHandler.Avaliable();
  }

  tick(interval: number, cb: (handler: ITickHandler) => void): void {
    const raf = global.getRequestAnimationFrame();
    raf(() => {
      if (this.released) {
        return;
      }
      cb(this);
    });
  }

  release() {
    this.released = true;
  }
  getTime() {
    return Date.now();
  }
}

export interface ITickHandler extends Releaseable {
  avaliable: () => boolean;
  /**
   * 开始执行tick
   * @param interval 延时 ms
   * @param cb 执行的回调
   */
  tick: (interval: number, cb: (handler: ITickHandler) => void) => void; // 开始
  tickTo?: (t: number, cb: (handler: ITickHandler, params?: { once: boolean }) => void) => void;
  getTime: () => number; // 获取时间
}

export interface ITickerHandlerStatic {
  Avaliable: () => boolean;
  new (): ITickHandler;
}

type TickerMode = 'raf' | 'timeout' | 'manual';

enum STATUS {
  INITIAL = 0, // initial表示初始状态
  RUNNING = 1, // running表示正在执行
  PAUSE = 2 // PULSE表示tick还是继续，只是不执行函数了
}

export class DefaultTicker implements ITicker {
  protected interval: number;
  protected tickerHandler: ITickHandler;
  protected _mode: TickerMode;
  protected status: STATUS;
  protected lastFrameTime: number;
  protected tickCounts: number;
  protected timelines: ITimeline[];
  autoStop: boolean;

  set mode(m: TickerMode) {
    if (this._mode === m) {
      return;
    }
    this._mode = m;
    this.setupTickHandler();
  }
  get mode(): TickerMode {
    return this._mode;
  }

  constructor(timelines: ITimeline[] = []) {
    this.init();
    this.lastFrameTime = -1;
    this.tickCounts = 0;
    this.timelines = timelines;
    this.autoStop = true;
  }

  init() {
    this.interval = NaN;
    this.status = STATUS.INITIAL;
    global.hooks.onSetEnv.tap('window', () => {
      this.initHandler();
    });
    if (global.env) {
      this.initHandler();
    }
  }

  addTimeline(timeline: ITimeline) {
    this.timelines.push(timeline);
  }
  remTimeline(timeline: ITimeline) {
    this.timelines = this.timelines.filter(t => t !== timeline);
  }

  protected initHandler(): ITickHandler | null {
    if (this._mode) {
      return null;
    }
    const ticks: { mode: TickerMode; cons: ITickerHandlerStatic }[] = [
      { mode: 'raf', cons: RAFTickHandler },
      { mode: 'timeout', cons: TimeOutTickHandler },
      { mode: 'manual', cons: ManualTickHandler }
    ];
    for (let i = 0; i < ticks.length; i++) {
      if (ticks[i].cons.Avaliable()) {
        this.mode = ticks[i].mode;
        break;
      }
    }
    return null;
  }

  /**
   * 设置tickHandler
   * @returns 返回true表示设置成功，false表示设置失败
   */
  protected setupTickHandler(): boolean {
    let handler: ITickHandler;
    // 创建下一个tickHandler
    switch (this._mode) {
      case 'raf':
        handler = new RAFTickHandler();
        break;
      case 'timeout':
        handler = new TimeOutTickHandler();
        break;
      case 'manual':
        handler = new ManualTickHandler();
        break;
      default:
        console.warn('非法的计时器模式');
        handler = new RAFTickHandler();
        break;
    }
    if (!handler.avaliable()) {
      return false;
    }

    // 销毁上一个tickerHandler
    if (this.tickerHandler) {
      this.tickerHandler.release();
    }
    this.tickerHandler = handler;
    return true;
  }

  setInterval(interval: number) {
    this.interval = interval;
  }
  getInterval(): number {
    return this.interval;
  }

  setFPS(fps: number): void {
    this.setInterval(1000 / fps);
  }
  getFPS(): number {
    return 1000 / this.interval;
  }
  tick(interval: number): void {
    this.tickerHandler.tick(interval, (handler: ITickHandler) => {
      this.handleTick(handler, { once: true });
    });
  }
  tickTo(t: number): void {
    if (!this.tickerHandler.tickTo) {
      return;
    }
    this.tickerHandler.tickTo(t, (handler: ITickHandler) => {
      this.handleTick(handler, { once: true });
    });
  }
  pause(): boolean {
    if (this.status === STATUS.INITIAL) {
      return false;
    }
    this.status = STATUS.PAUSE;
    return true;
  }
  resume(): boolean {
    if (this.status === STATUS.INITIAL) {
      return false;
    }
    this.status = STATUS.RUNNING;
    return true;
  }

  ifCanStop(): boolean {
    if (this.autoStop) {
      if (!this.timelines.length) {
        return true;
      }
      if (this.timelines.reduce((a, b) => a + b.animateCount, 0) === 0) {
        return true;
      }
    }
    return false;
  }

  start(force: boolean = false): boolean {
    if (this.status === STATUS.RUNNING) {
      return false;
    }
    if (!this.tickerHandler) {
      return false;
    }
    // 如果不需要start，那就不start
    if (!force) {
      // 暂停状态不执行
      if (this.status === STATUS.PAUSE) {
        return false;
      }
      if (!this.timelines.length) {
        return false;
      }
      if (this.timelines.reduce((a, b) => a + b.animateCount, 0) === 0) {
        return false;
      }
    }
    this.status = STATUS.RUNNING;
    this.tickerHandler.tick(0, this.handleTick);
    return true;
  }
  stop(): void {
    // 重新设置tickHandler
    this.status = STATUS.INITIAL;
    this.setupTickHandler();
    this.lastFrameTime = -1;
  }

  protected handleTick = (handler: ITickHandler, params?: { once?: boolean }) => {
    const { once = false } = params ?? {};
    // 尝试停止
    if (this.ifCanStop()) {
      this.stop();
      return;
    }
    this._handlerTick(handler);
    if (!once) {
      handler.tick(this.interval, this.handleTick);
    }
  };

  protected _handlerTick = (handler: ITickHandler) => {
    // 具体执行函数
    const tickerHandler = this.tickerHandler;
    const time = tickerHandler.getTime();
    // 上一帧经过的时间
    let delta = 0;
    if (this.lastFrameTime >= 0) {
      delta = time - this.lastFrameTime;
    }
    this.lastFrameTime = time;

    if (this.status !== STATUS.RUNNING) {
      return;
    }
    this.tickCounts++;

    this.timelines.forEach(t => {
      t.tick(delta);
    });
  };
}

export class ManualTicker extends DefaultTicker implements ITicker {
  protected declare interval: number;
  protected declare tickerHandler: ITickHandler;
  protected declare _mode: TickerMode;
  protected declare status: STATUS;
  protected declare lastFrameTime: number;
  protected declare tickCounts: number;
  protected declare timelines: ITimeline[];
  declare autoStop: boolean;

  set mode(m: TickerMode) {
    m = 'manual';
    this.setupTickHandler();
  }
  get mode(): TickerMode {
    return this._mode;
  }

  protected initHandler(): ITickHandler | null {
    this.mode = 'manual';
    return null;
  }

  /**
   * 设置tickHandler
   * @returns 返回true表示设置成功，false表示设置失败
   */
  protected setupTickHandler(): boolean {
    const handler: ITickHandler = new ManualTickHandler();
    this._mode = 'manual';

    // 销毁上一个tickerHandler
    if (this.tickerHandler) {
      this.tickerHandler.release();
    }
    this.tickerHandler = handler;
    return true;
  }

  tickAt(time: number) {
    this.tickerHandler.tick(time - this.lastFrameTime, (handler: ITickHandler) => {
      this.handleTick(handler, { once: true });
    });
  }

  ifCanStop(): boolean {
    return false;
  }
}
