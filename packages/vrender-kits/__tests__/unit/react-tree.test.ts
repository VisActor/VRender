jest.mock('../../src/jsx', () => ({
  REACT_TO_CANOPUS_EVENTS: {
    onClick: 'click'
  }
}));

import { decodeReactDom } from '../../src/react-tree';

describe('react-tree', () => {
  test('decodeReactDom returns original value for non react dom', () => {
    expect(decodeReactDom(null)).toBeNull();
    expect(decodeReactDom({ a: 1 })).toEqual({ a: 1 });
  });

  test("'rich/text' returns attribute object with text", () => {
    const graphic: any = {
      type: 'rich/text',
      attribute: { fontSize: 12 }
    };

    const dom: any = {
      $$typeof: Symbol('react.element'),
      type: () => graphic,
      props: {
        attribute: graphic.attribute,
        children: 'hello'
      }
    };

    expect(decodeReactDom(dom)).toEqual({ fontSize: 12, text: 'hello' });
  });

  test('default graphic maps react events and parses children recursively', () => {
    const add = jest.fn();
    const on = jest.fn();

    const graphic: any = {
      type: 'rect',
      attribute: { x: 1 },
      add,
      on
    };

    const childGraphic: any = {
      type: 'circle',
      add: jest.fn(),
      on: jest.fn()
    };

    const childDom: any = {
      $$typeof: Symbol('react.element'),
      type: () => childGraphic,
      props: {
        attribute: {},
        children: null as any
      }
    };

    const clickHandler = jest.fn();

    const dom: any = {
      $$typeof: Symbol('react.element'),
      type: () => graphic,
      props: {
        attribute: graphic.attribute,
        onClick: clickHandler,
        stateProxy: { s: 1 },
        id: 'id-1',
        name: 'name-1',
        children: [childDom, [childDom]]
      }
    };

    const out = decodeReactDom(dom) as any;

    expect(out).toBe(graphic);
    expect(graphic.stateProxy).toEqual({ s: 1 });
    expect(graphic.id).toBe('id-1');
    expect(graphic.name).toBe('name-1');

    expect(on).toHaveBeenCalledWith('click', clickHandler);
    expect(add).toHaveBeenCalledTimes(2);
  });

  test("'richtext' parses children into textConfig", () => {
    const richtextGraphic: any = {
      type: 'richtext',
      attribute: {},
      add: jest.fn(),
      on: jest.fn()
    };

    const childGraphic: any = {
      type: 'rich/image',
      attribute: { src: 'a.png' }
    };

    const childDom: any = {
      $$typeof: Symbol('react.element'),
      type: () => childGraphic,
      props: {
        attribute: childGraphic.attribute,
        children: null as any
      }
    };

    const dom: any = {
      $$typeof: Symbol('react.element'),
      type: () => richtextGraphic,
      props: {
        attribute: {},
        children: [childDom, null]
      }
    };

    decodeReactDom(dom);

    expect(richtextGraphic.attribute.textConfig).toHaveLength(1);
    expect(richtextGraphic.attribute.textConfig[0]).toEqual({ src: 'a.png' });
  });
});
