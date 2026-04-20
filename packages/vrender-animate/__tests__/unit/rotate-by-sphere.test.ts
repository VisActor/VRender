import { createText } from '@visactor/vrender-core';
import { Animate } from '../../src/animate';
import { RotateBySphereAnimate } from '../../src/custom/sphere';

describe('RotateBySphereAnimate', () => {
  test('onStart should fall back to target.attribute when finalAttribute is unavailable', () => {
    const target = createText({
      text: '1',
      x: 10,
      y: 20,
      z: 30
    } as any);
    const animate = new Animate('sphere-fallback');

    jest.spyOn(target as any, 'getGraphicService').mockReturnValue({
      onAttributeUpdate: jest.fn(),
      onSetStage: jest.fn()
    });

    animate.bind(target as any);

    expect(() => {
      animate.play(
        new RotateBySphereAnimate(null, null, 1000, 'linear', {
          center: { x: 0, y: 0, z: 0 },
          r: 100
        })
      );
      animate.advance(16);
    }).not.toThrow();
  });
});
