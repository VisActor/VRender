/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { Rect } from '../../src/graphic/rect';
import { application } from '../../src/application';

describe('texture-custom (resource)', () => {
  beforeAll(() => {
    application.global = {
      loadSvg: jest.fn(() => Promise.resolve({ data: null })),
      loadImage: jest.fn(() => Promise.resolve({ data: null })),
      getRequestAnimationFrame: () => (cb: () => void) => cb()
    } as any;
    application.graphicService = {
      onAttributeUpdate: jest.fn(),
      updateTempAABBBounds: jest.fn(() => ({
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        clear: jest.fn(),
        union: jest.fn(),
        setValue: jest.fn()
      })),
      transformAABBBounds: jest.fn()
    } as any;
  });

  it('creates resource cache when texture is HTMLCanvasElement in constructor', () => {
    const canvas = document.createElement('canvas');
    const rect = new Rect({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      texture: canvas
    });

    const res = rect.resources?.get(canvas);
    expect(res?.state).toBe('success');
    expect(res?.data).toBe(canvas);
  });

  it('creates resource cache when setAttribute texture is HTMLCanvasElement', () => {
    const canvas = document.createElement('canvas');
    const rect = new Rect({
      x: 0,
      y: 0,
      width: 10,
      height: 10
    });

    rect.setAttribute('texture', canvas);

    const res = rect.resources?.get(canvas);
    expect(res?.state).toBe('success');
    expect(res?.data).toBe(canvas);
  });

  it('marks resource as loading when texture is svg string', () => {
    const svg = `<svg t="1775469608211" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1306" width="40" height="40"><path d="M478.25 655.5h90.35v237.07h-90.35z" fill="#A5855E" p-id="1307"></path><path d="M568.6 905.07h-90.35c-6.9 0-12.5-5.6-12.5-12.5V655.5c0-6.9 5.6-12.5 12.5-12.5h90.35c6.9 0 12.5 5.6 12.5 12.5v237.07c0 6.9-5.6 12.5-12.5 12.5z m-77.85-25h65.35V668h-65.35v212.07z" p-id="1308"></path><path d="M607.99 905.07H438.87c-6.9 0-12.5-5.6-12.5-12.5s5.6-12.5 12.5-12.5h169.12c6.9 0 12.5 5.6 12.5 12.5s-5.6 12.5-12.5 12.5z" p-id="1309"></path><path d="M523.43 353.39L210.74 749.95l312.69-37.16 312.69 37.16-312.69-396.56z" fill="#ABCF78" p-id="1310"></path><path d="M836.12 762.45c-0.49 0-0.98-0.03-1.48-0.09l-311.21-36.99-311.21 36.99c-5.02 0.6-9.91-1.89-12.38-6.3a12.507 12.507 0 0 1 1.09-13.85l312.69-396.56c2.37-3.01 5.99-4.76 9.82-4.76s7.45 1.75 9.82 4.76l312.69 396.56a12.498 12.498 0 1 1-9.81 20.24z m-312.69-62.16c0.49 0 0.99 0.03 1.48 0.09l282.7 33.6-284.17-360.39-284.17 360.39 282.7-33.6c0.49-0.06 0.98-0.09 1.48-0.09z" p-id="1311"></path><path d="M523.43 277.55l-261 331.01 261-37.17 261 37.17-261-331.01z" fill="#C5E298" p-id="1312"></path><path d="M784.43 621.06c-0.58 0-1.17-0.04-1.77-0.13l-259.24-36.92-259.24 36.92c-5.06 0.72-10.05-1.71-12.6-6.14a12.496 12.496 0 0 1 1.02-13.98l261-331.01c2.37-3.01 5.99-4.76 9.82-4.76s7.45 1.75 9.82 4.76l261 331.01c3.16 4.01 3.57 9.55 1.02 13.98a12.504 12.504 0 0 1-10.83 6.26z m-261-323.32L291.58 591.78l230.09-32.77c1.17-0.17 2.36-0.17 3.52 0l230.09 32.77-231.85-294.04z" p-id="1313"></path><path d="M523.43 210.47L327.93 458.4l195.5-37.17 195.49 37.17-195.49-247.93z" fill="#ABCF78" p-id="1314"></path><path d="M718.92 470.9c-0.77 0-1.56-0.07-2.34-0.22l-193.16-36.72-193.16 36.72c-5.12 0.97-10.31-1.34-13.02-5.79a12.5 12.5 0 0 1 0.87-14.23L513.6 202.73c2.37-3.01 5.99-4.76 9.82-4.76s7.45 1.75 9.82 4.76l195.49 247.93a12.5 12.5 0 0 1 0.87 14.23 12.496 12.496 0 0 1-10.68 6.02z m-195.49-62.17c0.78 0 1.56 0.07 2.33 0.22l162.63 30.92-164.96-209.21-164.96 209.21 162.63-30.92c0.77-0.15 1.55-0.22 2.33-0.22z" p-id="1315"></path><path d="M523.43 151L378.37 334.96l145.06-37.93 145.05 37.93L523.43 151z" fill="#C5E298" p-id="1316"></path><path d="M668.48 347.47c-1.05 0-2.11-0.13-3.16-0.41l-141.9-37.11-141.9 37.11c-5.2 1.36-10.68-0.75-13.62-5.25a12.505 12.505 0 0 1 0.64-14.58L513.6 143.26c2.37-3.01 5.99-4.76 9.82-4.76s7.45 1.75 9.82 4.76L678.3 327.23c3.33 4.22 3.59 10.09 0.64 14.58a12.498 12.498 0 0 1-10.46 5.66z m-145.05-62.94c1.06 0 2.13 0.14 3.16 0.41l109.01 28.51-112.17-142.26-112.17 142.26 109.01-28.51c1.04-0.27 2.1-0.41 3.16-0.41z" p-id="1317"></path></svg>`;
    const rect = new Rect({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      texture: svg
    });

    const res = rect.resources?.get(svg);
    expect(res?.state).toBe('loading');
    expect(res?.data).toBe('init');
  });

  it('marks resource as loading when texture is image url', () => {
    const url =
      'https://lf-dp.bytetos.com/obj/dp-open-internet-cn/visactor-site/bytedance/client/img/visactor/navigator-logo.svg';
    const rect = new Rect({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      texture: url
    });

    const res = rect.resources?.get(url);
    expect(res?.state).toBe('loading');
    expect(res?.data).toBe('init');
  });
});
