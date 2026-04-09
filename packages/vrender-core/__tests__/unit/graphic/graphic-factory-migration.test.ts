import type { IRectGraphicAttribute } from '../../../src/interface';
import { createGraphic, graphicCreator, registerGraphic } from '../../../src/graphic';
import { DefaultGraphicService } from '../../../src/graphic/graphic-service/graphic-service';
import { Rect } from '../../../src/graphic/rect';
import { registerRectGraphic } from '../../../src/register/register-rect';

class GraphicStub {
  constructor(public readonly attribute: Record<string, unknown>) {}
}

describe('graphic factory migration', () => {
  test('registerGraphic should register creators for createGraphic', () => {
    registerGraphic('unit-stub', GraphicStub as any);

    const graphic = createGraphic('unit-stub', { x: 10, y: 20 });

    expect(graphic).toBeInstanceOf(GraphicStub);
    expect((graphic as any).attribute).toEqual({ x: 10, y: 20 });
  });

  test('graphicCreator compatibility api should delegate to the shared graphic factory', () => {
    graphicCreator.RegisterGraphicCreator('compat-stub', GraphicStub as any);

    const graphic = graphicCreator.CreateGraphic('compat-stub', { x: 30 });

    expect(graphic).toBeInstanceOf(GraphicStub);
    expect((graphic as any).attribute).toEqual({ x: 30 });
    expect((graphicCreator as any)['compat-stub']).toBeDefined();
  });

  test('registerRectGraphic should enable createGraphic for built-in rect types', () => {
    registerRectGraphic();

    const rect = createGraphic('rect', { width: 100, height: 50 } as IRectGraphicAttribute);

    expect(rect).toBeInstanceOf(Rect);
    expect((rect as Rect).attribute.width).toBe(100);
  });

  test('DefaultGraphicService should default to the shared graphic creator adapter', () => {
    const service = new DefaultGraphicService();

    expect(service.creator).toBe(graphicCreator);
    expect(service.creator.rect).toBeDefined();
  });
});
