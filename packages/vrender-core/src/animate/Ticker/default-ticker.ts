import { EventEmitter, Logger } from '@visactor/vutils';
import type { ITickHandler, ITickerHandlerStatic, ITimeline, ITicker } from '../../interface';
import { application } from '../../application';
import type { TickerMode } from './type';
import { STATUS } from './type';
import { RAFTickHandler } from './raf-tick-handler';
import { TimeOutTickHandler } from './timeout-tick-handler';

export class DefaultTicker extends EventEmitter implements ITicker {
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
    super();
    this.init();
    this.lastFrameTime = -1;
    this.tickCounts = 0;
    this.timelines = timelines;
    this.autoStop = true;
  }

  init() {
    this.interval = NaN;
    this.status = STATUS.INITIAL;
    application.global.hooks.onSetEnv.tap('default-ticker', () => {
      this.initHandler();
    });
    if (application.global.env) {
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
      { mode: 'timeout', cons: TimeOutTickHandler }
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
      // case 'manual':
      //   handler = new ManualTickHandler();
      // break;
      default:
        Logger.getInstance().warn('非法的计时器模式');
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
    this._handlerTick();
    if (!once) {
      handler.tick(this.interval, this.handleTick);
    }
  };

  protected _handlerTick = () => {
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
    this.emit('afterTick');
  };

  /**
   * 同步tick状态，需要手动触发tick执行，保证属性为走完动画的属性
   * 【注】grammar会设置属性到最终值，然后调用render，这时候需要VRender手动触发tick，保证属性为走完动画的属性，而不是Grammar设置上的属性
   */
  trySyncTickStatus() {
    if (this.status === STATUS.RUNNING) {
      this._handlerTick();
    }
  }
}
