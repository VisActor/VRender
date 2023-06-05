export interface ITicker {
  setFPS?: (fps: number) => void;
  setInterval?: (interval: number) => void;
  getFPS?: () => number;
  getInterval?: () => number;
  tick: (interval: number) => void;
  tickAt?: (time: number) => void;
  pause: () => boolean;
  resume: () => boolean;
  /**
   * 开启tick，force为true强制开启，否则如果timeline为空则不开启
   */
  start: (force?: boolean) => boolean;
  stop: () => void;
}
