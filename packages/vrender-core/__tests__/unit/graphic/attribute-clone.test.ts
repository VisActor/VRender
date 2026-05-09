import { createRect } from '../../../src/graphic/rect';

describe('Graphic attribute clone', () => {
  test('should adopt constructor attrs as graphic-owned static storage', () => {
    const dynamicTexture = jest.fn();
    const attrs = {
      width: 100,
      height: 100,
      texture: 'circle',
      textureOptions: {
        dynamicTexture
      }
    } as any;
    const rect = createRect(attrs);

    expect(rect.attribute).toBe(attrs);
    expect((rect as any).baseAttributes).toBe(attrs);

    expect(typeof rect.attribute.textureOptions.dynamicTexture).toBe('function');
    expect(rect.attribute.textureOptions.dynamicTexture).toBe(dynamicTexture);
    expect(typeof (rect as any).baseAttributes.textureOptions.dynamicTexture).toBe('function');
    expect((rect as any).baseAttributes.textureOptions.dynamicTexture).toBe(dynamicTexture);
  });

  test('should share simple baseAttributes until state forces an attribute fork', () => {
    const rect = createRect({
      width: 100,
      height: 100,
      fill: 'blue'
    } as any);

    jest.spyOn(rect as any, 'getGraphicService').mockReturnValue({
      onAttributeUpdate: jest.fn(),
      onSetStage: jest.fn()
    });

    rect.states = {
      hover: {
        fill: 'red'
      }
    } as any;

    expect(rect.attribute).toBe((rect as any).baseAttributes);

    rect.useStates(['hover'], false);

    expect(rect.attribute).not.toBe((rect as any).baseAttributes);
    expect(rect.attribute.fill).toBe('red');
    expect((rect as any).baseAttributes.fill).toBe('blue');
  });

  test('should fork adopted nested plain object attrs when state needs a visual layer', () => {
    const attrs = {
      width: 100,
      height: 100,
      fill: 'blue',
      shadowBlur: {
        value: 1,
        color: 'black'
      }
    } as any;
    const rect = createRect(attrs);

    jest.spyOn(rect as any, 'getGraphicService').mockReturnValue({
      onAttributeUpdate: jest.fn(),
      onSetStage: jest.fn()
    });

    rect.states = {
      hover: {
        fill: 'red'
      }
    } as any;

    expect(rect.attribute).toBe(attrs);
    expect((rect as any).baseAttributes).toBe(attrs);
    expect((rect as any).attribute.shadowBlur).toBe((rect as any).baseAttributes.shadowBlur);

    rect.useStates(['hover'], false);

    expect(rect.attribute).not.toBe((rect as any).baseAttributes);
    expect((rect as any).attribute.shadowBlur).not.toBe((rect as any).baseAttributes.shadowBlur);

    (rect.attribute as any).shadowBlur.value = 2;

    expect((rect as any).baseAttributes.shadowBlur.value).toBe(1);
    expect((rect as any).attribute.shadowBlur.value).toBe(2);
  });
});
