import { Animate } from '../../src/animate';
import { DefaultTimeline } from '../../src/timeline';

describe('Animate tracking bridge', () => {
  test('should use track/untrack hooks instead of writing target.animates directly', () => {
    const trackAnimate = jest.fn();
    const untrackAnimate = jest.fn();
    const target: any = {
      trackAnimate,
      untrackAnimate,
      onAnimateBind: jest.fn(),
      animationAttribute: undefined
    };
    const animate = new Animate('a', new DefaultTimeline(), true);

    animate.bind(target as any);

    expect(trackAnimate).toHaveBeenCalledWith(animate);
    expect((target as any).animates).toBeUndefined();

    animate.release();

    expect(untrackAnimate).toHaveBeenCalledWith('a');
  });
});
