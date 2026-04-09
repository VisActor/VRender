jest.mock('../../../../vrender-core/src/graphic/graphic-creator', () => ({
  createGraphic: jest.fn((type: string, attrs: Record<string, unknown>) => ({
    type,
    attribute: attrs
  }))
}));

import { createGraphic } from '../../../../vrender-core/src/graphic/graphic-creator';
import { graphicCreator } from '../../../src/util/graphic-creator';

describe('component graphic creator', () => {
  test('should delegate typed helpers to core createGraphic', () => {
    const rect = graphicCreator.rect({ width: 10, height: 20 } as any);
    const group = graphicCreator.group({ x: 1 } as any);

    expect(createGraphic).toHaveBeenNthCalledWith(1, 'rect', { width: 10, height: 20 });
    expect(createGraphic).toHaveBeenNthCalledWith(2, 'group', { x: 1 });
    expect(rect).toEqual({ type: 'rect', attribute: { width: 10, height: 20 } });
    expect(group).toEqual({ type: 'group', attribute: { x: 1 } });
  });
});
