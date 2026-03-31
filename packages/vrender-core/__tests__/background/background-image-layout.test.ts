import { DefaultAttribute } from '../../src/graphic/config';
import {
  DefaultBaseBackgroundRenderContribution,
  drawBackgroundImage
} from '../../src/render/contributions/render/contributions/base-contribution-render';
import { DefaultGroupBackgroundRenderContribution } from '../../src/render/contributions/render/contributions/group-contribution-render';
import { DefaultTextBackgroundRenderContribution } from '../../src/render/contributions/render/contributions/text-contribution-render';
import { DefaultDrawContribution } from '../../src/render/contributions/render/draw-contribution';

function createBounds(x: number, y: number, width: number, height: number) {
  return {
    x1: x,
    y1: y,
    x2: x + width,
    y2: y + height,
    width: () => width,
    height: () => height
  };
}

function createImage(width: number, height: number) {
  return { width, height };
}

function createContext() {
  return {
    dpr: 1,
    globalAlpha: 1,
    drawImage: jest.fn(),
    createPattern: jest.fn(),
    translate: jest.fn(),
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    clip: jest.fn(),
    rect: jest.fn(),
    beginPath: jest.fn(),
    highPerformanceSave: jest.fn(),
    highPerformanceRestore: jest.fn(),
    setCommonStyle: jest.fn(),
    setTransformFromMatrix: jest.fn(),
    setTransformForCurrent: jest.fn(),
    currentMatrix: { clone: () => ({}) }
  };
}

class TestBaseBackgroundRenderContribution extends DefaultBaseBackgroundRenderContribution {
  capturedParams: any;
  capturedBounds: any;

  protected doDrawImage(context: any, data: any, b: any, params: any): void {
    this.capturedBounds = b;
    this.capturedParams = params;
  }
}

class TestGroupBackgroundRenderContribution extends DefaultGroupBackgroundRenderContribution {
  capturedParams: any;

  protected doDrawImage(context: any, data: any, b: any, params: any): void {
    this.capturedParams = params;
  }
}

class TestTextBackgroundRenderContribution extends DefaultTextBackgroundRenderContribution {
  capturedParams: any;
  capturedBounds: any;

  protected doDrawImage(context: any, data: any, b: any, params: any): void {
    this.capturedBounds = b;
    this.capturedParams = params;
  }
}

class TestDrawContribution extends DefaultDrawContribution {
  constructor() {
    super([], { getContributions: (): any[] => [] } as any);
  }

  clear(renderService: any, context: any, drawContext: any) {
    this.clearScreen(renderService, context, drawContext);
  }
}

describe('background image layout', () => {
  test('supports cover layout with centered crop', () => {
    const context = createContext();

    drawBackgroundImage(context as any, createImage(200, 100), createBounds(0, 0, 100, 100) as any, {
      backgroundMode: 'no-repeat',
      backgroundFit: true,
      backgroundKeepAspectRatio: true,
      backgroundPosition: 'center'
    });

    expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), -50, 0, 200, 100);
  });

  test('supports contain layout with anchor positioning', () => {
    const context = createContext();

    drawBackgroundImage(context as any, createImage(200, 100), createBounds(0, 0, 100, 100) as any, {
      backgroundMode: 'no-repeat',
      backgroundFit: true,
      backgroundKeepAspectRatio: true,
      backgroundSizing: 'contain',
      backgroundPosition: 'bottom-right'
    });

    expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 50, 100, 50);
  });

  test('supports fill layout with scaling and centered alignment', () => {
    const context = createContext();

    drawBackgroundImage(context as any, createImage(20, 10), createBounds(0, 0, 100, 100) as any, {
      backgroundMode: 'no-repeat',
      backgroundFit: true,
      backgroundKeepAspectRatio: false,
      backgroundSizing: 'fill',
      backgroundScale: 0.5,
      backgroundPosition: 'center'
    });

    expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), 25, 25, 50, 50);
  });

  test('supports auto layout with percentage positioning', () => {
    const context = createContext();

    drawBackgroundImage(context as any, createImage(20, 10), createBounds(0, 0, 100, 100) as any, {
      backgroundMode: 'no-repeat',
      backgroundFit: false,
      backgroundKeepAspectRatio: true,
      backgroundSizing: 'auto',
      backgroundPosition: ['50%', '100%']
    });

    expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), 40, 90, 20, 10);
  });

  test('base contribution resolves wrapped background images by inner resource key', () => {
    const contribution = new TestBaseBackgroundRenderContribution();
    const context = createContext();

    contribution.drawShape(
      {
        attribute: {
          background: { background: 'image-key' },
          backgroundSizing: 'contain',
          backgroundPosition: 'center',
          backgroundClip: true
        },
        backgroundImg: true,
        resources: new Map([['image-key', { state: 'success', data: createImage(10, 10) }]]),
        transMatrix: { onlyTranslate: () => true },
        AABBBounds: createBounds(0, 0, 100, 100)
      } as any,
      context as any,
      0,
      0,
      false,
      false,
      false,
      false,
      DefaultAttribute as any,
      {} as any
    );

    expect(contribution.capturedParams.backgroundSizing).toBe('contain');
    expect(contribution.capturedParams.backgroundPosition).toBe('center');
    expect(context.clip).toHaveBeenCalled();
  });

  test('group contribution forwards sizing and position to shared renderer', () => {
    const contribution = new TestGroupBackgroundRenderContribution();
    const context = createContext();

    contribution.drawShape(
      {
        attribute: {
          background: 'image-key',
          backgroundSizing: 'contain',
          backgroundPosition: 'bottom-right',
          backgroundClip: true
        },
        backgroundImg: true,
        resources: new Map([['image-key', { state: 'success', data: createImage(10, 10) }]]),
        parent: { globalTransMatrix: {} },
        transMatrix: { onlyTranslate: () => true },
        AABBBounds: createBounds(0, 0, 100, 100)
      } as any,
      context as any,
      0,
      0,
      false,
      false,
      false,
      false,
      DefaultAttribute as any,
      {} as any
    );

    expect(contribution.capturedParams.backgroundSizing).toBe('contain');
    expect(contribution.capturedParams.backgroundPosition).toBe('bottom-right');
    expect(context.clip).toHaveBeenCalled();
  });

  test('text contribution respects wrapped background bounds and passes layout options', () => {
    const contribution = new TestTextBackgroundRenderContribution();
    const context = createContext();

    contribution.drawShape(
      {
        type: 'text',
        attribute: {
          background: {
            background: 'image-key',
            x: 10,
            y: 20,
            width: 30,
            height: 40,
            dx: 5,
            dy: 6
          },
          backgroundSizing: 'auto',
          backgroundPosition: 'bottom-right',
          backgroundClip: true,
          backgroundCornerRadius: 0
        },
        backgroundImg: true,
        resources: new Map([['image-key', { state: 'success', data: createImage(10, 10) }]]),
        parent: { globalTransMatrix: {} },
        transMatrix: { onlyTranslate: () => true },
        AABBBounds: createBounds(0, 0, 100, 100)
      } as any,
      context as any,
      0,
      0,
      false,
      false,
      false,
      false,
      DefaultAttribute as any,
      {} as any
    );

    expect(contribution.capturedBounds.x1).toBe(15);
    expect(contribution.capturedBounds.y1).toBe(26);
    expect(contribution.capturedBounds.width()).toBe(30);
    expect(contribution.capturedBounds.height()).toBe(40);
    expect(contribution.capturedParams.backgroundSizing).toBe('auto');
    expect(contribution.capturedParams.backgroundPosition).toBe('bottom-right');
    expect(context.clip).toHaveBeenCalled();
  });

  test('stage clear screen uses shared background layout options', () => {
    const drawContribution = new TestDrawContribution();
    const context = createContext();
    const stage = {
      backgroundImg: true,
      resources: new Map([['image-key', { state: 'success', data: createImage(200, 100) }]]),
      attribute: {
        opacity: 1,
        backgroundMode: 'no-repeat',
        backgroundFit: true,
        backgroundKeepAspectRatio: true,
        backgroundSizing: 'cover',
        backgroundPosition: 'center',
        backgroundScale: 1,
        backgroundOffsetX: 0,
        backgroundOffsetY: 0
      },
      hooks: {
        afterClearRect: {
          call: jest.fn()
        }
      }
    };

    drawContribution.clear(
      { drawParams: { stage } } as any,
      context as any,
      {
        clear: { background: 'image-key' },
        viewBox: createBounds(0, 0, 100, 100)
      } as any
    );

    expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), -50, 0, 200, 100);
  });
});
