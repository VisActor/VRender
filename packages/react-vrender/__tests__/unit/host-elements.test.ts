import { Arc, ElementOf, Group, Layer, Rect, ShadowRoot, TYPES } from '../../src/host-elements';

describe('react-vrender host-elements', () => {
  test('ElementOf returns element type', () => {
    const El = ElementOf<any, any, 'rect'>('rect');
    expect(El as any).toBe('rect');
  });

  test('TYPES exposes basic mapping', () => {
    expect(TYPES.layer).toBe('Layer');
    expect(TYPES.arc).toBe('Arc');
    expect(TYPES.group).toBe('Group');
  });

  test('exported host elements are string tags', () => {
    expect(Layer as any).toBe('layer');
    expect(Arc as any).toBe('arc');
    expect(Group as any).toBe('group');
    expect(Rect as any).toBe('rect');
    expect(ShadowRoot as any).toBe('shadowroot');
  });
});
