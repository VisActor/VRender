global.__DEV__ = true;
global.__VERSION__ = true;

function noop() {}

function createGradient() {
  return {
    addColorStop: noop
  };
}

function createCanvasContext(canvas) {
  const context = {
    canvas,
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    font: '10px sans-serif',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    imageSmoothingEnabled: true,
    save: noop,
    restore: noop,
    beginPath: noop,
    closePath: noop,
    clip: noop,
    stroke: noop,
    fill: noop,
    clearRect: noop,
    fillRect: noop,
    strokeRect: noop,
    rect: noop,
    arc: noop,
    arcTo: noop,
    ellipse: noop,
    moveTo: noop,
    lineTo: noop,
    bezierCurveTo: noop,
    quadraticCurveTo: noop,
    translate: noop,
    scale: noop,
    rotate: noop,
    transform: noop,
    setTransform: noop,
    resetTransform: noop,
    drawImage: noop,
    fillText: noop,
    strokeText: noop,
    setLineDash: noop,
    getLineDash: () => [],
    createLinearGradient: createGradient,
    createRadialGradient: createGradient,
    createConicGradient: createGradient,
    createPattern: () => ({}),
    createImageData: (width, height) => ({
      width,
      height,
      data: new Uint8ClampedArray(width * height * 4)
    }),
    getImageData: (x, y, width, height) => ({
      x,
      y,
      width,
      height,
      data: new Uint8ClampedArray(width * height * 4)
    }),
    putImageData: noop,
    measureText: text => ({
      width: String(text ?? '').length * 10,
      actualBoundingBoxAscent: 0,
      actualBoundingBoxDescent: 0,
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: String(text ?? '').length * 10,
      fontBoundingBoxAscent: 0,
      fontBoundingBoxDescent: 0
    }),
    isPointInPath: () => false,
    isPointInStroke: () => false,
    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })
  };

  return new Proxy(context, {
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }
      if (typeof prop === 'string') {
        target[prop] = noop;
        return target[prop];
      }
      return undefined;
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    }
  });
}

if (typeof window !== 'undefined') {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = callback => setTimeout(() => callback(Date.now()), 16);
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = handle => clearTimeout(handle);
  }

  if (!window.matchMedia) {
    window.matchMedia = query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: noop,
      removeListener: noop,
      addEventListener: noop,
      removeEventListener: noop,
      dispatchEvent: () => false
    });
  }

  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  if (!window.visualViewport) {
    window.visualViewport = {
      width: 0,
      height: 0,
      scale: 1,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
      addEventListener: noop,
      removeEventListener: noop
    };
  }
}

if (typeof global !== 'undefined') {
  if (!global.requestAnimationFrame && typeof window !== 'undefined') {
    global.requestAnimationFrame = window.requestAnimationFrame.bind(window);
  }

  if (!global.cancelAnimationFrame && typeof window !== 'undefined') {
    global.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
  }
}

if (typeof DOMRect === 'undefined') {
  global.DOMRect = class DOMRect {
    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.top = y;
      this.left = x;
      this.right = x + width;
      this.bottom = y + height;
    }

    toJSON() {
      return {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        top: this.top,
        right: this.right,
        bottom: this.bottom,
        left: this.left
      };
    }
  };
}

if (typeof PointerEvent === 'undefined' && typeof MouseEvent !== 'undefined') {
  global.PointerEvent = class PointerEvent extends MouseEvent {
    constructor(type, init = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? 'mouse';
      this.isPrimary = init.isPrimary ?? true;
    }
  };
}

if (typeof TouchEvent === 'undefined' && typeof Event !== 'undefined') {
  global.TouchEvent = class TouchEvent extends Event {
    constructor(type, init = {}) {
      super(type, init);
      this.touches = init.touches ?? [];
      this.targetTouches = init.targetTouches ?? this.touches;
      this.changedTouches = init.changedTouches ?? [];
      this.altKey = !!init.altKey;
      this.metaKey = !!init.metaKey;
      this.ctrlKey = !!init.ctrlKey;
      this.shiftKey = !!init.shiftKey;
    }
  };
}

if (typeof Path2D === 'undefined') {
  global.Path2D = class Path2D {
    addPath() {}
    moveTo() {}
    lineTo() {}
    rect() {}
    arc() {}
    closePath() {}
  };
}

if (typeof OffscreenCanvas === 'undefined') {
  global.OffscreenCanvas = class OffscreenCanvas {
    constructor(width = 300, height = 150) {
      this.width = width;
      this.height = height;
      this._context2d = createCanvasContext(this);
    }

    getContext(type) {
      if (type && type !== '2d') {
        return null;
      }
      return this._context2d;
    }

    convertToBlob() {
      return Promise.resolve(new Blob());
    }
  };
}

if (typeof HTMLCanvasElement !== 'undefined') {
  if (!HTMLCanvasElement.prototype.getContext || HTMLCanvasElement.prototype.getContext.name === 'getContext') {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: function getContext(type) {
        if (type && type !== '2d') {
          return null;
        }
        if (!this.__vrenderContext2d) {
          this.__vrenderContext2d = createCanvasContext(this);
        }
        return this.__vrenderContext2d;
      }
    });
  }

  if (!HTMLCanvasElement.prototype.getBoundingClientRect) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: function getBoundingClientRect() {
        return new DOMRect(0, 0, this.width || 0, this.height || 0);
      }
    });
  }

  if (!HTMLCanvasElement.prototype.toDataURL) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
      configurable: true,
      value: () => ''
    });
  }
}
