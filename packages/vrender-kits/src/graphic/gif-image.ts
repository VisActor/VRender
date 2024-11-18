import type { IImageGraphicAttribute, ISetAttributeContext } from '@visactor/vrender-core';
import { application, Image, ResourceLoader } from '@visactor/vrender-core';
import type { ITimeline } from '@visactor/vrender-core';
import { isString } from '@visactor/vutils';
import type { ParsedFrame } from 'gifuct-js';
import { decompressFrames, parseGIF } from 'gifuct-js';
import type { IGifImage, IGifImageGraphicAttribute } from '../interface/gif-image';
import { GIFIMAGE_NUMBER_TYPE } from './constants';

export class GifImage extends Image implements IGifImage {
  type: any = 'gif-image';
  declare attribute: IGifImageGraphicAttribute;

  frameImageData?: ImageData;
  tempCanvas?: HTMLCanvasElement;
  tempCtx?: CanvasRenderingContext2D;
  gifCanvas?: HTMLCanvasElement;
  gifCtx?: CanvasRenderingContext2D;
  loadedFrames?: ParsedFrame[];
  frameIndex?: number;
  playing?: boolean;
  lastTime?: number;

  constructor(params: IGifImageGraphicAttribute) {
    super(params);
    this.numberType = GIFIMAGE_NUMBER_TYPE;
    this.loadGif();
  }

  loadGif() {
    if (isString(this.attribute.gifImage)) {
      ResourceLoader.GetFile(this.attribute.gifImage, 'arrayBuffer')
        .then((res: ArrayBuffer) => {
          const gif = parseGIF(res);
          const frames = decompressFrames(gif, true);
          this.renderGIF(frames);
        })
        .catch(e => {
          console.error('Gif load error: ', e);
        });
    } else if (this.attribute.gifImage instanceof ArrayBuffer) {
      const gif = parseGIF(this.attribute.gifImage);
      const frames = decompressFrames(gif, true);
      this.renderGIF(frames);
    }
  }

  renderGIF(frames: ParsedFrame[]) {
    this.loadedFrames = frames;
    this.frameIndex = 0;

    if (!this.tempCanvas) {
      this.tempCanvas = application.global.createCanvas({});
      this.tempCtx = this.tempCanvas.getContext('2d');
    }

    if (!this.gifCanvas) {
      this.gifCanvas = application.global.createCanvas({});
      this.gifCtx = this.gifCanvas.getContext('2d');
    }

    this.gifCanvas.width = frames[0].dims.width;
    this.gifCanvas.height = frames[0].dims.height;

    this.playing = true;
    this.lastTime = new Date().getTime();
    const animation = this.animate();
    if (this.attribute.timeline) {
      animation.setTimeline(this.attribute.timeline);
    }
    animation.to({}, 1000, 'linear').loop(Infinity);
  }

  renderFrame(context: CanvasRenderingContext2D, x: number, y: number) {
    // get the frame
    const frame = this.loadedFrames[this.frameIndex || 0];

    if (frame.disposalType === 2) {
      this.gifCtx.clearRect(0, 0, this.gifCanvas.width, this.gifCanvas.height);
    }

    // draw image into gifCanvas
    this.drawPatch(frame);

    // draw gifCanvas into stage
    this.manipulate(context, x, y);

    // update the frame index
    const diff = new Date().getTime() - this.lastTime;
    if (frame.delay < diff) {
      this.frameIndex++;
      this.lastTime = new Date().getTime();
    }
    if (this.frameIndex >= this.loadedFrames.length) {
      this.frameIndex = 0;
    }
  }

  drawPatch(frame: ParsedFrame) {
    const dims = frame.dims;

    if (
      !this.frameImageData ||
      dims.width !== this.frameImageData.width ||
      dims.height !== this.frameImageData.height
    ) {
      this.tempCanvas.width = dims.width;
      this.tempCanvas.height = dims.height;
      this.frameImageData = this.tempCtx.createImageData(dims.width, dims.height);
    }

    // set the patch data as an override
    this.frameImageData.data.set(frame.patch);

    // draw the patch back over the canvas
    this.tempCtx.putImageData(this.frameImageData, 0, 0);

    this.gifCtx.drawImage(this.tempCanvas, dims.left, dims.top);
  }

  manipulate(context: CanvasRenderingContext2D, x: number, y: number) {
    context.drawImage(
      this.gifCanvas,
      0,
      0,
      this.gifCanvas.width,
      this.gifCanvas.height,
      x,
      y,
      this.attribute.width,
      this.attribute.height
    );
  }

  setAttribute(key: string, value: any, forceUpdateTag?: boolean, context?: ISetAttributeContext): void {
    super.setAttribute(key, value, forceUpdateTag, context);
    if (key === 'gifImage') {
      this.loadGif();
    }
  }

  setAttributes(
    params: Partial<IGifImageGraphicAttribute>,
    forceUpdateTag?: boolean,
    context?: ISetAttributeContext
  ): void {
    super.setAttributes(params, forceUpdateTag, context);
    if (params.gifImage) {
      this.loadGif();
    }
  }
}

export function createGifImage(attributes: IGifImageGraphicAttribute): IGifImage {
  return new GifImage(attributes);
}
