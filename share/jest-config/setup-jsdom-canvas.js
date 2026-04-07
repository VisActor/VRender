const path = require('path');

function loadCanvasModule() {
  const repoRoot = path.resolve(__dirname, '../..');
  const lookupRoots = [
    path.resolve(repoRoot, 'packages/vrender-kits'),
    path.resolve(repoRoot, 'packages/vrender'),
    path.resolve(repoRoot, 'packages/vrender-core')
  ];
  const errors = [];

  for (const root of lookupRoots) {
    try {
      const resolved = require.resolve('canvas', { paths: [root] });
      return require(resolved);
    } catch (error) {
      errors.push(`${root}: ${error.message}`);
    }
  }

  throw new Error(
    [
      'Failed to load the `canvas` package for Jest jsdom tests.',
      'Reinstall dependencies with the current Node.js version before running tests.',
      ...errors
    ].join('\n')
  );
}

const canvasModule = loadCanvasModule();
const { createCanvas, Image, ImageData, DOMMatrix, DOMPoint } = canvasModule;
const backingCanvasKey = Symbol.for('vrender.jsdom.backingCanvas');
const measureCanvas = createCanvas(1, 1);
const measureContext = measureCanvas.getContext('2d');

function parsePixels(value, fallback = NaN) {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value !== 'string' || value.trim() === '') {
    return fallback;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getFontSize(style) {
  return parsePixels(style?.fontSize, 16);
}

function getLineHeight(style) {
  return parsePixels(style?.lineHeight, getFontSize(style));
}

function getFont(style) {
  const fontStyle = style?.fontStyle || 'normal';
  const fontWeight = style?.fontWeight || 'normal';
  const fontSize = getFontSize(style);
  const fontFamily = style?.fontFamily || 'sans-serif';
  return `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
}

function measureElementText(element) {
  if (!measureContext) {
    return { width: 0, height: 0 };
  }

  const text = (element.textContent || element.innerText || '').replace(/\u00a0/g, ' ');
  if (!text) {
    return { width: 0, height: getLineHeight(element.style) };
  }

  measureContext.font = getFont(element.style);
  return {
    width: measureContext.measureText(text).width,
    height: getLineHeight(element.style)
  };
}

function getElementWidth(element) {
  if (element.tagName === 'CANVAS') {
    return parsePixels(element.style?.width, element.width || 0);
  }

  const explicitWidth = parsePixels(element.style?.width, NaN);
  if (Number.isFinite(explicitWidth)) {
    return explicitWidth;
  }

  return measureElementText(element).width;
}

function getElementHeight(element) {
  if (element.tagName === 'CANVAS') {
    return parsePixels(element.style?.height, element.height || 0);
  }

  const explicitHeight = parsePixels(element.style?.height, NaN);
  if (Number.isFinite(explicitHeight)) {
    return explicitHeight;
  }

  return measureElementText(element).height;
}

function createRect(element) {
  const width = getElementWidth(element);
  const height = getElementHeight(element);
  const left = parsePixels(element.style?.left, 0);
  const top = parsePixels(element.style?.top, 0);

  return {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON() {
      return this;
    }
  };
}

function getBackingCanvas(canvasElement) {
  let backingCanvas = canvasElement[backingCanvasKey];
  const width = canvasElement.width || 300;
  const height = canvasElement.height || 150;

  if (!backingCanvas) {
    backingCanvas = createCanvas(width, height);
    canvasElement[backingCanvasKey] = backingCanvas;
  }

  if (backingCanvas.width !== width) {
    backingCanvas.width = width;
  }
  if (backingCanvas.height !== height) {
    backingCanvas.height = height;
  }

  return backingCanvas;
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'devicePixelRatio', {
    configurable: true,
    value: 1
  });

  if (!window.matchMedia) {
    window.matchMedia = query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      }
    });
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = callback => setTimeout(() => callback(Date.now()), 16);
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = handle => clearTimeout(handle);
  }

  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = () => 'blob:vrender-jest';
  }

  if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = () => {};
  }

  if (!window.PointerEvent && window.MouseEvent) {
    window.PointerEvent = window.MouseEvent;
  }

  if (!window.OffscreenCanvas) {
    window.OffscreenCanvas = class OffscreenCanvas {
      constructor(width, height) {
        return createCanvas(width, height);
      }
    };
  }

  if (window.HTMLElement) {
    Object.defineProperty(window.HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get() {
        return getElementWidth(this);
      }
    });

    Object.defineProperty(window.HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get() {
        return getElementHeight(this);
      }
    });

    Object.defineProperty(window.HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get() {
        return getElementWidth(this);
      }
    });

    Object.defineProperty(window.HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get() {
        return getElementHeight(this);
      }
    });

    Object.defineProperty(window.HTMLElement.prototype, 'offsetLeft', {
      configurable: true,
      get() {
        return parsePixels(this.style?.left, 0);
      }
    });

    Object.defineProperty(window.HTMLElement.prototype, 'offsetTop', {
      configurable: true,
      get() {
        return parsePixels(this.style?.top, 0);
      }
    });

    Object.defineProperty(window.HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value() {
        return createRect(this);
      }
    });
  }

  if (window.HTMLCanvasElement) {
    Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value(type, options) {
        return getBackingCanvas(this).getContext(type, options);
      }
    });

    Object.defineProperty(window.HTMLCanvasElement.prototype, 'toDataURL', {
      configurable: true,
      value(...args) {
        return getBackingCanvas(this).toDataURL(...args);
      }
    });

    Object.defineProperty(window.HTMLCanvasElement.prototype, 'toBuffer', {
      configurable: true,
      value(...args) {
        return getBackingCanvas(this).toBuffer(...args);
      }
    });
  }
}

global.Image = Image;
global.ImageData = ImageData;
global.DOMMatrix = DOMMatrix;
global.DOMPoint = DOMPoint;

if (typeof window !== 'undefined') {
  window.Image = Image;
  window.ImageData = ImageData;
  window.DOMMatrix = DOMMatrix;
  window.DOMPoint = DOMPoint;
}

global.requestAnimationFrame = window.requestAnimationFrame.bind(window);
global.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
global.PointerEvent = window.PointerEvent;
global.OffscreenCanvas = window.OffscreenCanvas;
