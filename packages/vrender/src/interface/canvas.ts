/**
 * 提供ICanvas和ICanvasLike封装
 */
import { Releaseable } from './common';
import type { IContextLike, IContext2d } from './context';

export type CanvasConfigType = {
  width?: number;
  height?: number;
  dpr?: number;
  x?: number;
  y?: number;
  container?: HTMLElement | string;
  visiable?: boolean;
  nativeCanvas: HTMLCanvasElement | any;
  canvasControled?: boolean;
  id?: string;
};

export interface ICanvas extends Releaseable {
  width: number;
  height: number;
  id: number | string;
  x: number;
  y: number;
  visiable: boolean;
  nativeCanvas: HTMLCanvasElement | any;
  displayWidth: number;
  displayHeight: number;
  dpr: number;

  getContext: (contextId?: '2d', contextAttributes?: CanvasRenderingContext2DSettings) => IContext2d | null;

  getNativeCanvas: () => HTMLCanvasElement | any;

  // getContext(
  //     contextId: 'bitmaprenderer',
  //     contextAttributes?: WebGLContextAttributes,
  // ): ImageBitmapRenderingContext | null;

  // getContext(contextId: 'webgl', contextAttributes?: WebGLContextAttributes): WebGLRenderingContext | null;

  // getContext(contextId: 'webgl2', contextAttributes?: WebGLContextAttributes): WebGL2RenderingContext | null;

  convertToBlob: (options?: { type?: string | undefined; quality?: number | undefined }) => Promise<Blob>;

  transferToImageBitmap: () => ImageBitmap;

  resetStyle: (params: Partial<CanvasConfigType>) => void;
  applyPosition: () => void;

  hide: () => void;
  show: () => void;

  resize: (width: number, height: number) => void;

  toDataURL: (() => string) &
    ((mimeType: 'image/png') => string) &
    ((mimeType: 'image/jpeg', quality: number) => string);

  readPixels: (x: number, y: number, w: number, h: number) => ImageData | Promise<ImageData>;

  release: () => void;
}

export interface ICanvasLike {
  width: number;
  height: number;

  /** _Non standard._ The type of the canvas. */
  readonly type?: 'image' | 'pdf' | 'svg';

  /** _Non standard._ Getter. The stride used by the canvas. */
  readonly stride?: number;

  /** Constant used in PNG encoding methods. */
  readonly PNG_NO_FILTERS?: number;
  /** Constant used in PNG encoding methods. */
  readonly PNG_ALL_FILTERS?: number;
  /** Constant used in PNG encoding methods. */
  readonly PNG_FILTER_NONE?: number;
  /** Constant used in PNG encoding methods. */
  readonly PNG_FILTER_SUB?: number;
  /** Constant used in PNG encoding methods. */
  readonly PNG_FILTER_UP?: number;
  /** Constant used in PNG encoding methods. */
  readonly PNG_FILTER_AVG?: number;
  /** Constant used in PNG encoding methods. */
  readonly PNG_FILTER_PAETH?: number;

  getContext: (contextId: string) => IContextLike;
}
