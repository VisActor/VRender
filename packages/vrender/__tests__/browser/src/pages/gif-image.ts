import { createStage, container } from '@visactor/vrender-core';
import { GifImage, IGifImageGraphicAttribute, gifImageModule, gifImageCanvasPickModule } from '@visactor/vrender-kits';
import { addShapesToStage, colorPools } from '../utils';

container.load(gifImageModule);
container.load(gifImageCanvasPickModule);

export const page = () => {
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

  const stage = createStage({
    canvas: 'main',
    width: 1200,
    height: 600,
    viewWidth: 1200,
    viewHeight: 600
  });

  addShapesToStage(stage, shapes as any, true);
  stage.render();

  stage.addEventListener('click', e => {
    console.log('target', e.target);
  });
};
