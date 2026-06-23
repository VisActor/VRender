/** @deprecated Legacy DI browser fixture retained for major-migration tracking. Prefer app-scoped entries/plugins. */
import { getLegacyBindingContext } from '@visactor/vrender-core';
import {
  GifImage,
  IGifImageGraphicAttribute,
  bindGifImageCanvasPickerContribution,
  bindGifImageRenderContribution
} from '@visactor/vrender-kits';
import { createBrowserPageStage } from '../page-stage';
import { addShapesToStage, colorPools } from '../utils';

const legacyContext = getLegacyBindingContext();
bindGifImageRenderContribution(legacyContext);
bindGifImageCanvasPickerContribution(legacyContext);

export const page = () => {
  const stage = createBrowserPageStage({
    canvas: 'main',
    width: 1200,
    height: 600,
    viewWidth: 1200,
    viewHeight: 600
  });

  const shapes = [];
  shapes.push(
    new GifImage({
      x: 100,
      y: 100,
      width: 50,
      height: 50,
      gifImage: './sources/loading.gif'
    } as IGifImageGraphicAttribute)
  );

  shapes.push(
    new GifImage({
      x: 200,
      y: 100,
      width: 50,
      height: 50,
      gifImage: './sources/loading.gif'
    } as IGifImageGraphicAttribute)
  );

  shapes.push(
    new GifImage({
      x: 100,
      y: 200,
      width: 50,
      height: 50,
      gifImage: './sources/loading-1.gif'
    } as IGifImageGraphicAttribute)
  );

  shapes.push(
    new GifImage({
      x: 200,
      y: 200,
      width: 50,
      height: 50,
      gifImage: './sources/loading-1.gif'
    } as IGifImageGraphicAttribute)
  );

  addShapesToStage(stage, shapes as any, true);
  stage.render();

  stage.addEventListener('click', e => {
    console.log('target', e.target);
  });
};
