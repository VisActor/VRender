import { Image } from '../../src/graphic/image';
import {
  DefaultCanvasImageRender,
  drawImageWithLayout,
  resolveImageMode,
  shouldClipImageByLayout
} from '../../src/render/contributions/render/image-render';
import { drawBackgroundImage } from '../../src/render/contributions/render/contributions/base-contribution-render';

function createImageData(width: number, height: number) {
  return { width, height };
}

function createContext() {
  return {
    dpr: 1,
    globalAlpha: 1,
    fillStyle: '',
    beginPath: jest.fn(),
    rect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    clip: jest.fn(),
    stroke: jest.fn(),
    drawImage: jest.fn(),
    createPattern: jest.fn(),
    translate: jest.fn(),
    fillRect: jest.fn(),
    setCommonStyle: jest.fn(),
    setShadowBlendStyle: jest.fn(),
    setStrokeStyle: jest.fn()
  };
}

function prepareRenderableImage(image: Image) {
  image._actualWidth = image.attribute.width as number;
  image._actualHeight = image.attribute.height as number;
  (image as any).tryUpdateAABBBounds = jest.fn();
  return image;
}

describe('image layout', () => {
  test('supports cover layout with centered crop', () => {
    const context = createContext();

    drawImageWithLayout(context as any, createImageData(200, 100), 0, 0, 100, 100, {
      imageMode: 'cover',
      imagePosition: 'center'
    });

    expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), -50, 0, 200, 100);
  });

  test('supports contain layout with centered blank space', () => {
    const context = createContext();

    drawImageWithLayout(context as any, createImageData(200, 100), 0, 0, 100, 100, {
      imageMode: 'contain',
      imagePosition: 'center'
    });

    expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 25, 100, 50);
  });

  test('supports sizing shorthand through imageMode', () => {
    const context = createContext();

    drawImageWithLayout(context as any, createImageData(200, 100), 0, 0, 100, 100, {
      imageMode: 'contain',
      imagePosition: 'center'
    });

    expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 25, 100, 50);
  });

  test('imageMode is ignored when repeat mode is enabled', () => {
    expect(
      resolveImageMode({
        repeatX: 'repeat',
        repeatY: 'repeat',
        imageMode: 'cover'
      })
    ).toEqual({
      repeatMode: 'repeat',
      sizingMode: 'fill'
    });
  });

  test('defaults to fill when imageMode is undefined', () => {
    expect(
      resolveImageMode({
        repeatX: 'no-repeat',
        repeatY: 'no-repeat'
      })
    ).toEqual({
      repeatMode: 'no-repeat',
      sizingMode: 'fill'
    });
  });

  test('supports fill layout to match target size', () => {
    const context = createContext();

    drawImageWithLayout(context as any, createImageData(200, 100), 0, 0, 100, 100, {
      imageMode: 'fill'
    });

    expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 100, 100);
  });

  test('uses intrinsic size when image element width and height are zero', () => {
    const context = createContext();

    drawBackgroundImage(
      context as any,
      {
        width: 0,
        height: 0,
        naturalWidth: 200,
        naturalHeight: 100
      },
      {
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        width: () => 100,
        height: () => 100
      } as any,
      {
        backgroundMode: 'no-repeat',
        backgroundFit: true,
        backgroundKeepAspectRatio: false
      }
    );

    expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 100, 100);
  });

  test('supports auto layout with original size and positioning', () => {
    const context = createContext();

    drawImageWithLayout(context as any, createImageData(20, 10), 0, 0, 100, 100, {
      imageMode: 'auto',
      imagePosition: 'center'
    });

    expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), 40, 45, 20, 10);
  });

  test('clips when image content may overflow container', () => {
    const render = new DefaultCanvasImageRender({ getContributions: (): any[] => [] } as any);
    const context = createContext();
    const image = prepareRenderableImage(
      new Image({
        width: 100,
        height: 100,
        image: createImageData(200, 100) as any,
        imageMode: 'cover',
        imagePosition: 'center'
      })
    );

    render.drawShape(image, context as any, 0, 0, {} as any);

    expect(context.clip).toHaveBeenCalledTimes(1);
    expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), -50, 0, 200, 100);
  });

  test('keeps default fill behavior without extra clip', () => {
    const render = new DefaultCanvasImageRender({ getContributions: (): any[] => [] } as any);
    const context = createContext();
    const image = prepareRenderableImage(
      new Image({
        width: 100,
        height: 100,
        image: createImageData(200, 100) as any
      })
    );

    render.drawShape(image, context as any, 0, 0, {} as any);

    expect(shouldClipImageByLayout(image.attribute)).toBe(false);
    expect(context.clip).not.toHaveBeenCalled();
    expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 100, 100);
  });

  test('does not clip for contain mode at default params', () => {
    expect(
      shouldClipImageByLayout({
        repeatX: 'no-repeat',
        repeatY: 'no-repeat',
        imageMode: 'contain',
        imageScale: 1,
        imageOffsetX: 0,
        imageOffsetY: 0,
        imagePosition: 'center'
      })
    ).toBe(false);
  });

  test('clips for contain mode when scale or offset overflows', () => {
    expect(
      shouldClipImageByLayout({
        repeatX: 'no-repeat',
        repeatY: 'no-repeat',
        imageMode: 'contain',
        imageScale: 2,
        imageOffsetX: 0,
        imageOffsetY: 0,
        imagePosition: 'center'
      })
    ).toBe(true);
  });
});
