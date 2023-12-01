import type { IImageGraphicAttribute, IImage } from './core';
import { Image, container, graphicCreator, imageModule } from './core';
import { browser } from './isbrowser';
import { imageCanvasPickModule, imageMathPickModule, textCanvasPickModule, textMathPickModule } from './kits';

export function createImage(attributes: IImageGraphicAttribute): IImage {
  return new Image(attributes);
}

export function registerImage() {
  graphicCreator.RegisterGraphicCreator('image', createImage);
  container.load(imageModule);
  container.load(browser ? imageCanvasPickModule : imageMathPickModule);
}
