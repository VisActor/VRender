import { labelSmartInvert, contrastAccessibilityChecker, smartInvertStrategy } from '../../../src/util/label-smartInvert';

describe('util/label-smartInvert', () => {
  test('labelSmartInvert returns original foreground when input not string', () => {
    expect(labelSmartInvert(undefined as any, '#fff' as any)).toBeUndefined();
    expect(labelSmartInvert('#000000' as any, undefined as any)).toBe('#000000');
  });

  test('labelSmartInvert keeps foreground when contrast ok', () => {
    expect(labelSmartInvert('#000000', '#ffffff')).toBe('#000000');
  });

  test('labelSmartInvert prefers provided alternativeColors when contrast fails', () => {
    expect(labelSmartInvert('#ffffff', '#ffffff', undefined, undefined, '#0000ff')).toBe('#0000ff');
  });

  test('labelSmartInvert picks default alternative when contrast fails', () => {
    expect(labelSmartInvert('#ffffff', '#ffffff')).toBe('#000000');
  });

  test('contrastAccessibilityChecker lightness mode', () => {
    expect(contrastAccessibilityChecker('#000000', '#000000', undefined, undefined, 'lightness')).toBe(false);
    expect(contrastAccessibilityChecker('#000000', '#ffffff', undefined, undefined, 'lightness')).toBe(true);
  });

  test('contrastAccessibilityChecker threshold branch', () => {
    expect(contrastAccessibilityChecker('#777777', '#888888', undefined, 7)).toBe(false);
  });

  test('contrastAccessibilityChecker largeText branch', () => {
    expect(contrastAccessibilityChecker('#777777', '#ffffff', 'largeText' as any)).toBe(true);
    expect(contrastAccessibilityChecker('#cccccc', '#ffffff', 'largeText' as any)).toBe(false);
  });

  test('smartInvertStrategy', () => {
    expect(smartInvertStrategy('base' as any, 'a', 'b', 'c')).toBe('a');
    expect(smartInvertStrategy('invertBase' as any, 'a', 'b', 'c')).toBe('b');
    expect(smartInvertStrategy('similarBase' as any, 'a', 'b', 'c')).toBe('c');
    expect(smartInvertStrategy('unknown' as any, 'a', 'b', 'c')).toBeUndefined();
  });
});
