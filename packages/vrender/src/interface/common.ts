export type ICurveType =
  | 'basis'
  | 'basisClosed'
  | 'basisOpen'
  | 'bundle'
  | 'cardinal'
  | 'cardinalClosed'
  | 'cardinalOpen'
  | 'stepBefore'
  | 'stepAfter'
  | 'catmullRom'
  | 'catmullRomClosed'
  | 'catmullRomOpen'
  | 'linear'
  | 'linearClosed'
  | 'monotoneX'
  | 'monotoneY'
  | 'natural'
  | 'radial'
  | 'step';

export type MaybePromise<T> = T | PromiseLike<T>;

// 所有的接口都应当继承这个，避免内存没有释放
export interface Releaseable {
  release: (...params: any) => void;
}

export interface IEventElement {
  // event接口
  addEventListener: (<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ) => void) &
    ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void);
  on: (<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ) => void) &
    ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void);
  once: (<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ) => void) &
    ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void);
  removeEventListener: (<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ) => void) &
    ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void);
  off: (<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ) => void) &
    ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void);
  removeAllListeners: (<K extends keyof DocumentEventMap>(type: K) => void) & ((type: string) => void);
  dispatchEvent: (event: any) => boolean;
  emit: (event: any, ...args: any) => boolean;
}

export interface IDomRectLike {
  bottom: number;
  left: number;
  right: number;
  top: number;
  height: number;
  width: number;
  x: number;
  y: number;
}

export type IDirection = 1 | 2;
