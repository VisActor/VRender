import { contributionRegistry, GraphicRender } from '@visactor/vrender-core';
import { DefaultCanvasGifImageRender } from './gif-image-render';

let _registered = false;
export function registerCanvasGifImageRender() {
  if (_registered) {
    return;
  }
  _registered = true;
  contributionRegistry.register(GraphicRender, new DefaultCanvasGifImageRender());
}
