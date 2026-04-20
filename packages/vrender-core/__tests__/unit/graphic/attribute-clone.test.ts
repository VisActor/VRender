import { shouldUseSimpleAttributeFastPath } from '../../../src/graphic/graphic';
import { createRect } from '../../../src/graphic/rect';

describe('Graphic attribute clone', () => {
  test('should only enable the simple attrs fast path when top-level values contain no plain objects', () => {
    expect(
      shouldUseSimpleAttributeFastPath({
        x: 0,
        y: 0,
        width: 10,
        height: 20,
        fill: 'red',
        segments: [1, 2, 3],
        dynamicFill: () => 'blue'
      })
    ).toBe(true);

    expect(
      shouldUseSimpleAttributeFastPath({
        x: 0,
        shadowBlur: {
          value: 10
        }
      })
    ).toBe(false);
  });

  test('should preserve nested function values when cloning base attributes', () => {
    const dynamicTexture = jest.fn();
    const rect = createRect({
      width: 100,
      height: 100,
      texture: 'circle',
      textureOptions: {
        dynamicTexture
      }
    } as any);

    expect(typeof rect.attribute.textureOptions.dynamicTexture).toBe('function');
    expect(rect.attribute.textureOptions.dynamicTexture).toBe(dynamicTexture);
    expect(typeof (rect as any).baseAttributes.textureOptions.dynamicTexture).toBe('function');
    expect((rect as any).baseAttributes.textureOptions.dynamicTexture).toBe(dynamicTexture);
  });

  test('should keep baseAttributes isolated while reusing a lighter attribute surface clone', () => {
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

    expect(rect.attribute).not.toBe((rect as any).baseAttributes);

    (rect.attribute as any).shadowBlur = { value: 1, color: 'black' };

    expect((rect as any).baseAttributes.shadowBlur).toBeUndefined();

    rect.useStates(['hover'], false);

    expect(rect.attribute.fill).toBe('red');
    expect((rect as any).baseAttributes.fill).toBe('blue');
  });

  test('should keep nested plain object attrs on the conservative constructor path', () => {
    const rect = createRect({
      width: 100,
      height: 100,
      fill: 'blue',
      shadowBlur: {
        value: 1,
        color: 'black'
      }
    } as any);

    expect((rect as any).attribute.shadowBlur).not.toBe((rect as any).baseAttributes.shadowBlur);

    (rect.attribute as any).shadowBlur.value = 2;

    expect((rect as any).baseAttributes.shadowBlur.value).toBe(1);
    expect((rect as any).attribute.shadowBlur.value).toBe(2);
  });
});
