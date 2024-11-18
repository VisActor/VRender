import type { IGraphic, IImageGraphicAttribute, ITimeline } from '@visactor/vrender-core';
import type { ParsedFrame } from 'gifuct-js';

export interface IGifImageGraphicAttribute extends IImageGraphicAttribute {
  timeline?: ITimeline;
  gifImage?: string | ArrayBuffer;
}

export interface IGifImage extends IGraphic<IGifImageGraphicAttribute> {
  frameImageData?: ImageData;
  tempCanvas?: HTMLCanvasElement;
  tempCtx?: CanvasRenderingContext2D;
  gifCanvas?: HTMLCanvasElement;
  gifCtx?: CanvasRenderingContext2D;
  loadedFrames?: ParsedFrame[];
  frameIndex?: number;
  playing?: boolean;
  lastTime?: number;
}
