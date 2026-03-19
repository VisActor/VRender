import { AABBBounds } from '@visactor/vutils';
import { GlyphPickerBase } from '../../../src/picker/contributions/common/glyph-picker-base';

describe('picker/contributions/common/glyph-picker-base', () => {
  test('returns false when AABB does not contain point', () => {
    const picker = new GlyphPickerBase();
    const bounds = new AABBBounds();
    bounds.setValue(0, 0, 10, 10);

    const glyph: any = {
      AABBBounds: { containsPoint: () => false },
      attribute: { pickMode: 'precise' },
      getSubGraphic: (): any[] => []
    };

    expect(picker.contains(glyph, { x: 1, y: 1 } as any, {} as any)).toBe(false);
  });

  test('returns true for pickMode=imprecise even without pickContext', () => {
    const picker = new GlyphPickerBase();
    const bounds = new AABBBounds();
    bounds.setValue(0, 0, 10, 10);

    const glyph: any = {
      AABBBounds: bounds,
      attribute: { pickMode: 'imprecise' },
      getSubGraphic: (): any[] => []
    };

    expect(picker.contains(glyph, { x: 1, y: 1 } as any, undefined)).toBe(true);
  });

  test('requires pickContext even when pickerService exists', () => {
    const picker = new GlyphPickerBase();
    const bounds = new AABBBounds();
    bounds.setValue(0, 0, 10, 10);

    const glyph: any = {
      AABBBounds: bounds,
      attribute: { pickMode: 'precise' },
      getSubGraphic: (): any[] => []
    };

    expect(picker.contains(glyph, { x: 1, y: 1 } as any, { pickerService: {} } as any)).toBe(false);
  });

  test('delegates to pickerService.pickItem for sub graphics', () => {
    const picker = new GlyphPickerBase();
    const bounds = new AABBBounds();
    bounds.setValue(0, 0, 10, 10);

    const g1: any = { id: 1 };
    const g2: any = { id: 2 };

    const glyph: any = {
      AABBBounds: bounds,
      attribute: { pickMode: 'precise' },
      getSubGraphic: () => [g1, g2]
    };

    const pickItem = jest.fn((g: any) => {
      if (g === g1) {
        return { graphic: g1 };
      }
      return null;
    });

    const res = picker.contains(glyph, { x: 1, y: 1 } as any, { pickContext: {}, pickerService: { pickItem } } as any);
    expect(res).toBe(true);
    expect(pickItem).toHaveBeenCalled();
  });
});
