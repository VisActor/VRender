jest.mock('../../src/processProps', () => {
  return {
    splitProps: jest.fn((props: any) => {
      const { onPointerDown, ...graphicProps } = props;
      return {
        graphicProps,
        eventProps: { onPointerDown }
      };
    }),
    bindGraphicEvent: jest.fn()
  };
});

const rectInstance = { addEventListener: jest.fn() };
const glyphInstance = {
  type: 'glyph',
  addEventListener: jest.fn(),
  getSubGraphic: jest.fn(() => []),
  setSubGraphic: jest.fn()
};
const shadowRootInstance = { type: 'shadowroot', addEventListener: jest.fn() };

jest.mock('@visactor/vrender', () => {
  return {
    graphicCreator: {
      rect: jest.fn(() => rectInstance)
    },
    createGlyph: jest.fn(() => glyphInstance),
    createShadowRoot: jest.fn(() => shadowRootInstance),
    createText: jest.fn(() => ({ addEventListener: jest.fn() }))
  };
});

import { splitProps, bindGraphicEvent } from '../../src/processProps';
import { createInstance, render, reconcilor } from '../../src/hostConfig';

describe('react-vrender hostConfig', () => {
  test('createInstance: default graphic branch binds events', () => {
    const props = { x: 1, onPointerDown: (): void => undefined };
    const inst = createInstance('rect' as any, props as any, null as any);

    expect(splitProps).toHaveBeenCalled();
    expect(inst).toBe(rectInstance);
    expect(bindGraphicEvent).toHaveBeenCalledWith({ onPointerDown: props.onPointerDown }, rectInstance);
  });

  test('createInstance: glyph and shadowroot branches', () => {
    const glyph = createInstance('glyph' as any, { onPointerDown: (): void => undefined } as any, null as any);
    expect(glyph).toBe(glyphInstance);

    const sr = createInstance('shadowroot' as any, {} as any, null as any);
    expect(sr).toBe(shadowRootInstance);
  });

  test('createInstance: layer branch uses stage.createLayer()', () => {
    const layer: any = { layer: null };
    layer.layer = layer;

    const stage: any = {
      stage: null,
      createLayer: jest.fn(() => layer)
    };
    stage.stage = stage;

    const inst = createInstance('layer' as any, {} as any, stage as any);
    expect(stage.createLayer).toHaveBeenCalledTimes(1);
    expect(inst).toBe(layer);
  });

  test('render() wires reconciler calls', () => {
    const createSpy = jest.spyOn(reconcilor, 'createContainer').mockReturnValue({ _fiber: true } as any);
    const updateSpy = jest
      .spyOn(reconcilor, 'updateContainer')
      .mockImplementation((_component: any, _container: any, _parent: any, callback?: (() => void) | null) => {
        callback?.();
        return undefined as any;
      });

    const component = { type: 'rect' } as any;
    const target = { stage: null } as any;
    const cb = jest.fn();

    render(component, target, cb);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalled();
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
