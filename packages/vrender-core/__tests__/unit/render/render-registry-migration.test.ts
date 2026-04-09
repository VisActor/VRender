import type { IDrawContribution, IGraphic, IGraphicRender, IRenderServiceDrawParams } from '../../../src/interface';
import { RendererRegistry } from '../../../src/registry';
import { DefaultDrawContribution } from '../../../src/render/contributions/render/draw-contribution';
import { DefaultRenderService } from '../../../src/render/render-service';

function createRenderer(numberType: number, style?: string): IGraphicRender {
  return {
    type: `graphic-${numberType}`,
    numberType,
    style,
    draw: jest.fn(),
    reInit: jest.fn()
  };
}

function createGraphic(numberType: number, renderStyle?: string): IGraphic {
  return {
    numberType,
    type: `graphic-${numberType}`,
    attribute: {
      renderStyle
    }
  } as unknown as IGraphic;
}

function createDrawContributionStub(): IDrawContribution {
  return {
    currentRenderMap: new Map(),
    defaultRenderMap: new Map(),
    styleRenderMap: new Map(),
    draw: jest.fn(),
    reInit: jest.fn(),
    renderGroup: jest.fn(),
    renderItem: jest.fn(),
    getRenderContribution: jest.fn()
  };
}

describe('render registry migration', () => {
  test('DefaultDrawContribution should initialize renderer maps from RendererRegistry', () => {
    const registry = new RendererRegistry();
    const defaultRenderer = createRenderer(1);
    const styledRenderer = createRenderer(1, 'rough');

    registry.register('default-renderer', defaultRenderer);
    registry.register('rough-renderer', styledRenderer);

    const drawContribution = new DefaultDrawContribution([], undefined as any, {
      rendererRegistry: registry,
      global: {} as any,
      layerService: {} as any
    });

    expect(drawContribution.defaultRenderMap.get(1)).toBe(defaultRenderer);
    expect(drawContribution.styleRenderMap.get('rough')?.get(1)).toBe(styledRenderer);
    expect(drawContribution.getRenderContribution(createGraphic(1, 'rough'))).toBe(styledRenderer);
  });

  test('DefaultDrawContribution should reuse cached renderer instances from RendererRegistry on reInit', () => {
    const registry = new RendererRegistry();
    const rendererFactory = jest.fn(() => createRenderer(2));
    registry.register('cached-renderer', rendererFactory);

    const drawContribution = new DefaultDrawContribution([], undefined as any, {
      rendererRegistry: registry,
      global: {} as any,
      layerService: {} as any
    });

    drawContribution.reInit();

    expect(rendererFactory).toHaveBeenCalledTimes(1);
    expect(drawContribution.defaultRenderMap.get(2)).toBe(registry.get('cached-renderer'));
  });

  test('DefaultRenderService should support explicit drawContribution without DI container', () => {
    const drawContribution = createDrawContributionStub();
    const renderService = new DefaultRenderService(drawContribution);
    const params = {
      updateBounds: false
    } as IRenderServiceDrawParams;

    renderService.render([], params);

    expect(drawContribution.draw).toHaveBeenCalledWith(renderService, expect.objectContaining(params));
    expect(drawContribution.reInit).not.toHaveBeenCalled();
  });
});
