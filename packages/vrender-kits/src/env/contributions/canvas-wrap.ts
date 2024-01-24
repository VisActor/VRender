export class CanvasWrapDisableWH {
  protected _w: number;
  protected _h: number;
  protected ctx: any;
  nativeCanvas: any;
  id: any;
  readonly dpr: number;
  get width(): number {
    return this._w * this.dpr;
  }
  set width(w: number) {
    return;
  }
  get height(): number {
    return this._h * this.dpr;
  }
  set height(h: number) {
    return;
  }
  get offsetWidth(): number {
    return this._w;
  }
  set offsetWidth(w: number) {
    return;
  }
  get offsetHeight(): number {
    return this._h;
  }
  set offsetHeight(h: number) {
    return;
  }

  constructor(nativeCanvas: any, ctx: any, dpr: number, w: number, h: number, id: any) {
    this.nativeCanvas = nativeCanvas;
    this.ctx = ctx;
    this._w = w;
    this._h = h;
    this.id = id;
    nativeCanvas.id = id;
    this.dpr = dpr;
  }

  getContext() {
    return this.ctx;
  }
  // 构造 getBoundingClientRect 方法
  getBoundingClientRect() {
    return {
      width: this._w,
      height: this._h
    };
  }
}

export class CanvasWrapEnableWH {
  protected _w: number;
  protected _h: number;
  protected ctx: any;
  nativeCanvas: any;
  id: any;
  readonly dpr: number;

  get width(): number {
    return this._w * this.dpr;
  }
  set width(w: number) {
    this._w = w / this.dpr;
    this.nativeCanvas.width = w;
  }
  get height(): number {
    return this._h * this.dpr;
  }
  set height(h: number) {
    this._h = h / this.dpr;
    this.nativeCanvas.height = h;
  }
  get offsetWidth(): number {
    return this._w;
  }
  set offsetWidth(w: number) {
    this._w = w;
    this.nativeCanvas.width = w * this.dpr;
  }
  get offsetHeight(): number {
    return this._h;
  }
  set offsetHeight(h: number) {
    this._h = h;
    this.nativeCanvas.height = h * this.dpr;
  }

  constructor(nativeCanvas: any, ctx: any, dpr: number, w: number, h: number, id: any) {
    this.nativeCanvas = nativeCanvas;
    this.ctx = ctx;
    this._w = w;
    this._h = h;
    this.id = id;
    nativeCanvas.id = id;
    this.dpr = dpr;
  }

  getContext() {
    return this.ctx;
  }
  // 构造 getBoundingClientRect 方法
  getBoundingClientRect() {
    return {
      width: this._w,
      height: this._h
    };
  }
}
