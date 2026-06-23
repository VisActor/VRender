/**
 * @jest-environment node
 */

import { createNodeVRenderApp, createRect, vglobal, type IApp } from '../../src';

declare const require: any;

let NativeCanvasPkg: any;
try {
  NativeCanvasPkg = require('canvas');
} catch (_err) {
  NativeCanvasPkg = null;
}

const createGradientMock = () => ({
  addColorStop: jest.fn()
});

function createContextMock(canvas: any) {
  const target: Record<string, any> = {
    canvas,
    globalAlpha: 1,
    measureText: (text: string) => ({ width: String(text).length * 10 }),
    getImageData: (_x: number, _y: number, width: number, height: number) => ({
      data: new Uint8ClampedArray(width * height * 4),
      width,
      height
    }),
    createImageData: (width: number, height: number) => ({
      data: new Uint8ClampedArray(width * height * 4),
      width,
      height
    }),
    createLinearGradient: createGradientMock,
    createRadialGradient: createGradientMock,
    createConicGradient: createGradientMock,
    createPattern: () => ({})
  };

  return new Proxy(target, {
    get(source, key) {
      if (key in source) {
        return source[key as string];
      }
      return jest.fn();
    },
    set(source, key, value) {
      source[key as string] = value;
      return true;
    }
  });
}

const CanvasPkg = {
  createCanvas: (width: number, height: number) => {
    const canvas: Record<string, any> = {
      width,
      height,
      style: {},
      toBuffer: () => new Uint8Array([1, 2, 3]),
      getBoundingClientRect: () => ({ left: 0, top: 0, width, height })
    };
    const context = createContextMock(canvas);
    canvas.getContext = () => context;
    return canvas;
  },
  createImageData: (data: Uint8ClampedArray, width: number, height?: number) => ({
    data,
    width,
    height: height ?? data.length / width / 4
  }),
  loadImage: jest.fn()
};

function renderNodeRectStage(app: IApp): number {
  const stage = app.createStage({
    width: 100,
    height: 80,
    autoRender: false,
    autoRefresh: false,
    disableDirtyBounds: true,
    background: 'transparent'
  });

  try {
    stage.defaultLayer.add(createRect({ x: 10, y: 12, width: 30, height: 24, fill: 'red' }));
    stage.render();
    return stage.window.getImageBuffer('image/png').length;
  } finally {
    stage.release();
  }
}

function renderNodeRect(app: IApp): number {
  try {
    return renderNodeRectStage(app);
  } finally {
    app.release();
  }
}

describe('node app-scoped runtime', () => {
  test('reports missing node env params without reusing stale app runtime state', () => {
    const app = createNodeVRenderApp();

    try {
      expect(() => app.createStage({ width: 100, height: 80, autoRender: false })).toThrow(
        'Node env requires node-canvas package'
      );
    } finally {
      app.release();
    }
  });

  test('renders through createNodeVRenderApp envParams without legacy global setup', () => {
    const app = createNodeVRenderApp({ envParams: CanvasPkg });

    expect(renderNodeRect(app)).toBeGreaterThan(0);
  });

  test('can release and recreate node stages on the same app', () => {
    const app = createNodeVRenderApp({ envParams: CanvasPkg });

    try {
      expect(renderNodeRectStage(app)).toBeGreaterThan(0);
      expect(renderNodeRectStage(app)).toBeGreaterThan(0);
    } finally {
      app.release();
    }
  });

  test('inherits existing vglobal node env params for legacy-compatible callers', () => {
    vglobal.setEnv('node', CanvasPkg);

    const app = createNodeVRenderApp();

    expect(renderNodeRect(app)).toBeGreaterThan(0);
  });

  (NativeCanvasPkg ? test : test.skip)('renders through native node-canvas when available for current Node ABI', () => {
    const app = createNodeVRenderApp({ envParams: NativeCanvasPkg });

    expect(renderNodeRect(app)).toBeGreaterThan(0);
  });
});
