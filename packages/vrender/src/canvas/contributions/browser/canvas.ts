import { injectable } from 'inversify';
import { application } from '../../../application';
import { BaseCanvas } from '../base-canvas';
import type { CanvasConfigType, ICanvas, IContext2d, EnvType } from '../../../interface';
import { BrowserContext2d } from './context';

@injectable()
export class BrowserCanvas extends BaseCanvas implements ICanvas {
  static env: EnvType = 'browser';

  /**
   * 通过canvas生成一个wrap对象，初始化时不会再设置canvas的属性
   * @param params
   */
  constructor(params: CanvasConfigType) {
    super(params);
  }

  init(params: CanvasConfigType) {
    const { container } = params;
    if (typeof container === 'string') {
      const _c = application.global.getElementById(container);
      if (_c) {
        this._container = _c;
      }
    } else {
      this._container = container;
    }
    this._context = new BrowserContext2d(this, this._dpr);
    this.initStyle();
  }

  protected initStyle() {
    if (!this.controled) {
      return;
    }
    const { nativeCanvas } = this;
    nativeCanvas.width = this._pixelWidth;
    nativeCanvas.height = this._pixelHeight;

    const isOffscreen = !nativeCanvas.style;
    if (!isOffscreen) {
      this.setCanvasStyle(nativeCanvas, this._x, this._y, this._displayWidth, this._displayHeight);
    }
    if (this.id != null) {
      nativeCanvas.id = this.id.toString();
    }
    if (this._container) {
      this._container.appendChild(nativeCanvas);
    }
    if (!this.visiable) {
      this.hide();
    }
  }

  hide() {
    this._nativeCanvas && (this._nativeCanvas.style.display = 'none');
  }
  show() {
    this._nativeCanvas && (this._nativeCanvas.style.display = 'block');
  }

  applyPosition() {
    const canvas = this._nativeCanvas;
    canvas.style.position = 'absolute';
    canvas.style.top = `${this._y}px`;
    canvas.style.left = `${this._x}px`;
  }

  resetStyle(params: Partial<CanvasConfigType>) {
    if (!this.controled) {
      return;
    }
    const {
      width = this._displayWidth,
      height = this._displayHeight,
      dpr = this._dpr,
      x = this._x,
      y = this._y
    } = params;
    const { nativeCanvas } = this;
    nativeCanvas.width = width * dpr;
    nativeCanvas.height = height * dpr;

    const isOffscreen = !nativeCanvas.style;
    if (!isOffscreen) {
      this.setCanvasStyle(nativeCanvas, x, y, width, height);
    }
    params.id && (nativeCanvas.id = params.id);
    if (!this.visiable) {
      this.hide();
    }
    // this._context.setScale(dpr, dpr);
  }

  private setCanvasStyle(canvas: HTMLCanvasElement, x: number, y: number, w: number, h: number) {
    if (!this.controled) {
      return;
    }
    canvas.style.padding = '0';
    canvas.style.margin = '0';
    canvas.style.border = '0';
    canvas.style.background = 'transparent';
    // canvas.style.position = 'absolute';
    // canvas.style.top = `${y}px`;
    // canvas.style.left = `${x}px`;

    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }

  toDataURL(): string;
  toDataURL(mimeType: 'image/png'): string;
  toDataURL(mimeType: 'image/jpeg', quality: number): string;
  toDataURL(mimeType?: string, quality?: number) {
    if (mimeType === 'image/jpeg') {
      return this._nativeCanvas.toDataURL(mimeType, quality);
    } else if (mimeType === 'image/png') {
      return this._nativeCanvas.toDataURL(mimeType);
    }
    return this._nativeCanvas.toDataURL(mimeType, quality);
  }

  /**
   * 设置canvas的size大小，设置context的scale
   * @param width
   * @param height
   */
  resize(width: number, height: number) {
    if (!this.controled) {
      return;
    }
    // 设置Canvas的w和h
    this._pixelWidth = width * this._dpr;
    this._pixelHeight = height * this._dpr;
    this._displayWidth = width;
    this._displayHeight = height;
    // 可能是离屏canvas
    if (this._nativeCanvas.style) {
      this._nativeCanvas.style.width = `${width}px`;
      this._nativeCanvas.style.height = `${height}px`;
    }
    this._nativeCanvas.width = this._pixelWidth;
    this._nativeCanvas.height = this._pixelHeight;

    // 设置context的dpr
    const _context = this._context;
    _context.dpr = this._dpr;
    // _context.setScale(this._dpr, this._dpr);
  }
}
