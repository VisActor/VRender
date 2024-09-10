import type { ITicker, ITickHandler, ITimeline } from '../../interface/animate';
import { DefaultTicker } from './default-ticker';
import { ManualTickHandler } from './manual-ticker-handler';
import type { STATUS, TickerMode } from './type';

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
    this.tickerHandler.tick(time - Math.max(this.lastFrameTime, 0), (handler: ITickHandler) => {
      this.handleTick(handler, { once: true });
    });
  }

  ifCanStop(): boolean {
    return false;
  }
}
