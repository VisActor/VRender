export type TickerMode = 'raf' | 'timeout' | 'manual';

export enum STATUS {
  INITIAL = 0, // initial表示初始状态
  RUNNING = 1, // running表示正在执行
  PAUSE = 2 // PULSE表示tick还是继续，只是不执行函数了
}
