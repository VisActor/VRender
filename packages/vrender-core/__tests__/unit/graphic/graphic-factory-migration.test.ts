import type { IRectGraphicAttribute } from '../../../src/interface';
import { createGraphic, graphicCreator, registerGraphic } from '../../../src/graphic';
import { Arc3d } from '../../../src/graphic/arc3d';
import { Graphic } from '../../../src/graphic/base';
import { DefaultGraphicService } from '../../../src/graphic/graphic-service/graphic-service';
import { Group } from '../../../src/graphic/group';
import { Rect } from '../../../src/graphic/rect';
import { registerArc3dGraphic } from '../../../src/register/register-arc3d';
import { registerGroupGraphic } from '../../../src/register/register-group';
import { registerRectGraphic } from '../../../src/register/register-rect';

class GraphicStub {
  constructor(public readonly attribute: Record<string, unknown>) {}
}

describe('graphic factory migration', () => {
  test('graphic registry should use realm-level shared state for duplicated ESM entry evaluation', () => {
    registerGraphic('realm-shared-stub', GraphicStub as any);

    const registryState = (globalThis as any)[Symbol.for('@visactor/vrender-core/graphic-registry')];

    expect(registryState).toBeDefined();
    expect(registryState.graphicCreator).toBe(graphicCreator);
    expect(registryState.graphicFactory.create('realm-shared-stub', { x: 1 })).toBeInstanceOf(GraphicStub);
    expect(createGraphic('realm-shared-stub', { x: 2 })).toBeInstanceOf(GraphicStub);
  });

  test('Graphic class should use realm-level shared state for duplicated ESM entry evaluation', () => {
    registerGroupGraphic();
    registerArc3dGraphic();

    const classState = (globalThis as any)[Symbol.for('@visactor/vrender-core/graphic-class')];
    const group = createGraphic('group', {});
    const arc3d = createGraphic('arc3d', {});

    expect(classState).toBeDefined();
    expect(classState.Graphic).toBe(Graphic);
    expect(group).toBeInstanceOf(classState.Graphic);
    expect(arc3d).toBeInstanceOf(classState.Graphic);
  });

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

  test('registerGroupGraphic should enable createGraphic for group from a separate register entry', () => {
    registerGroupGraphic();

    const group = createGraphic('group', {});

    expect(group).toBeInstanceOf(Group);
  });

  test('registerArc3dGraphic should enable createGraphic for arc3d from a separate register entry', () => {
    registerArc3dGraphic();

    const arc3d = createGraphic('arc3d', {});

    expect(arc3d).toBeInstanceOf(Arc3d);
  });

  test('DefaultGraphicService should default to the shared graphic creator adapter', () => {
    const service = new DefaultGraphicService();

    expect(service.creator).toBe(graphicCreator);
    expect(service.creator.rect).toBeDefined();
  });

  test('DefaultGraphicService should not expose the old path proxy bounds helper', () => {
    const service = new DefaultGraphicService();

    expect('updatePathProxyAABBBounds' in service).toBe(false);
  });
});
