import '@visactor/vrender';
import render from '../../util/render';
import { GifImage, IGifImageGraphicAttribute } from '../../../src';

export function run() {
  const radios: GifImage[] = [];

  radios.push(
    new GifImage({
      x: 100,
      y: 100,
      width: 50,
      height: 50,
      gifImage: './sources/loading.gif'
    } as IGifImageGraphicAttribute)
  );

  radios.push(
    new GifImage({
      x: 200,
      y: 100,
      width: 50,
      height: 50,
      gifImage: './sources/loading.gif'
    } as IGifImageGraphicAttribute)
  );

  radios.push(
    new GifImage({
      x: 100,
      y: 200,
      width: 50,
      height: 50,
      gifImage: './sources/loading-1.gif'
    } as IGifImageGraphicAttribute)
  );

  radios.push(
    new GifImage({
      x: 200,
      y: 200,
      width: 50,
      height: 50,
      gifImage: './sources/loading-1.gif'
    } as IGifImageGraphicAttribute)
  );

  const stage = render(radios, 'main');
}
