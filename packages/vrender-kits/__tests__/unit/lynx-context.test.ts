import { application } from '@visactor/vrender-core/application';
import { LynxContext2d } from '../../src/canvas/contributions/lynx/context';

test('lynx context normalizes device-scaled font metrics', () => {
  const metrics = {
    width: 80,
    actualBoundingBoxAscent: 12,
    actualBoundingBoxDescent: 4,
    fontBoundingBoxAscent: 28,
    fontBoundingBoxDescent: 10
  };
  const context = new LynxContext2d(
    {
      nativeCanvas: {
        getContext: () => ({ measureText: () => metrics, setTransform: (): void => undefined })
      }
    } as any,
    2
  );
  const global = application.global;
  application.global = { devicePixelRatio: 1 } as any;

  try {
    expect(context.measureText('VRender', 'native')).toEqual({
      ...metrics,
      fontBoundingBoxAscent: 14,
      fontBoundingBoxDescent: 5
    });
  } finally {
    application.global = global;
  }
});
