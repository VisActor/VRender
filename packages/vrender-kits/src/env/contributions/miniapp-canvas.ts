import type { ICreateCanvasParams, ITTCanvas } from '@visactor/vrender-core';
import { CanvasWrapDisableWH, CanvasWrapEnableWH } from './canvas-wrap';

export type MiniAppCanvasFactoryOptions = {
  id?: string;
  width: number;
  height: number;
  dpr: number;
  offscreen: boolean;
};

export type MiniAppCanvasFactory = (options: MiniAppCanvasFactoryOptions) => any;

export type MiniAppCanvasEnvParams = {
  pixelRatio?: number;
  canvasFactory?: MiniAppCanvasFactory;
  [key: string]: any;
};

export function getMiniAppCanvasOptions(
  params: ICreateCanvasParams,
  pixelRatio: number,
  offscreen: boolean = params.id == null
): MiniAppCanvasFactoryOptions {
  return {
    id: params.id == null ? undefined : String(params.id),
    width: params.width ?? 0,
    height: params.height ?? 0,
    dpr: params.dpr ?? pixelRatio,
    offscreen
  };
}

export function wrapMiniAppNativeCanvas(nativeCanvas: any, options: MiniAppCanvasFactoryOptions): ITTCanvas {
  const ctx = nativeCanvas?.getContext?.('2d');
  if (!ctx) {
    throw new Error('MiniApp canvas bridge returned a canvas without getContext("2d").');
  }
  return new CanvasWrapEnableWH(nativeCanvas, ctx, options.dpr, options.width, options.height, options.id);
}

export function wrapMiniAppContextCanvas(ctx: any, options: MiniAppCanvasFactoryOptions): ITTCanvas {
  if (!ctx) {
    throw new Error('MiniApp canvas bridge returned an empty 2d context.');
  }
  const canvas = new CanvasWrapDisableWH(ctx.canvas || {}, ctx, options.dpr, options.width, options.height, options.id);
  ctx.canvas = canvas;
  return canvas;
}

export function createCanvasWithFactory(
  params: ICreateCanvasParams,
  pixelRatio: number,
  canvasMap: Map<string, ITTCanvas>,
  factory?: MiniAppCanvasFactory
): ITTCanvas | null {
  const options = getMiniAppCanvasOptions(params, pixelRatio);
  const id = options.id;
  if (id != null) {
    const existing = canvasMap.get(id);
    if (existing) {
      return existing;
    }
  }
  if (!factory) {
    return null;
  }

  const canvas = wrapMiniAppNativeCanvas(factory(options), options);
  if (id != null) {
    canvasMap.set(id, canvas);
  }
  return canvas;
}
