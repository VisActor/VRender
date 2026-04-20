import { createRect } from '@visactor/vrender-core';
import { Animate } from '../../src/animate';
import { ACustomAnimate } from '../../src/custom/custom-animate';

class NullPropsAnimate extends ACustomAnimate<any> {
  onBind(): void {
    this.propKeys = ['x'];
  }

  onStart(): void {
    super.onStart();
  }

  onUpdate(): void {
    // no-op
  }
}

describe('custom animate null props', () => {
  test('play should not throw when custom animate is created with null to-props', () => {
    const target = createRect({
      x: 10,
      y: 20,
      width: 30,
      height: 40
    });
    const animate = new Animate('null-props');

    jest.spyOn(target as any, 'getGraphicService').mockReturnValue({
      onAttributeUpdate: jest.fn(),
      onSetStage: jest.fn()
    });

    animate.bind(target as any);

    expect(() => {
      animate.play(new NullPropsAnimate(null, null, 1000, 'linear'));
    }).not.toThrow();
  });
});
