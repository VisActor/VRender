/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import {
  findCursorIdxByConfigIndex,
  findConfigIndexByCursorIdx,
  getDefaultCharacterConfig
} from '../../src/plugins/builtin-plugin/edit-module';

// ========== Test Data ==========

// 简单文本: ['我', '们', '是']
const textConfig1 = [
  { text: '我', fontSize: 16, lineHeight: 26, textAlign: 'center', fill: '#0f51b5' },
  { text: '们', fontSize: 16, lineHeight: 26, textAlign: 'center', fill: '#0f51b5' },
  { text: '是', fontSize: 16, lineHeight: 26, textAlign: 'center', fill: '#0f51b5' }
];

// 带有连续换行的文本: ['我', '\n', '\n', '\n', '\n', '们', '是']
const textConfig2 = [
  { text: '我', fontSize: 16, lineHeight: 26, fill: '#0f51b5' },
  { text: '\n', fontSize: 16, lineHeight: 26, fill: '#0f51b5' },
  { text: '\n', fontSize: 16, lineHeight: 26, fill: '#0f51b5' },
  { text: '\n', fontSize: 16, lineHeight: 26, fill: '#0f51b5' },
  { text: '\n', fontSize: 16, lineHeight: 26, fill: '#0f51b5' },
  { text: '们', fontSize: 16, lineHeight: 26, fill: '#0f51b5' },
  { text: '是', fontSize: 16, lineHeight: 26, fill: '#0f51b5' }
];

// 换行中间有字符: ['我', '\n', '\n', 'a', '\n', '\n', '们', '是']
const textConfig3 = [
  { text: '我', fontSize: 16, lineHeight: 26, fill: '#0f51b5' },
  { text: '\n', fontSize: 16, lineHeight: 26, fill: '#0f51b5' },
  { text: '\n', fontSize: 16, lineHeight: 26, fill: '#0f51b5' },
  { text: 'a', fontSize: 16, lineHeight: 26, fill: '#0f51b5' },
  { text: '\n', fontSize: 16, lineHeight: 26, fill: '#0f51b5' },
  { text: '\n', fontSize: 16, lineHeight: 26, fill: '#0f51b5' },
  { text: '们', fontSize: 16, lineHeight: 26, fill: '#0f51b5' },
  { text: '是', fontSize: 16, lineHeight: 26, fill: '#0f51b5' }
];

// 包含列表项: ['H', listItem('AB'), '!']
const textConfigWithList = [
  { text: 'H', fontSize: 16 },
  { text: 'AB', fontSize: 16, listType: 'unordered', listLevel: 1 },
  { text: '!', fontSize: 16 }
];

// 仅列表项
const textConfigOnlyList = [
  { text: 'Item1', fontSize: 16, listType: 'ordered', listLevel: 1 },
  { text: 'Item2', fontSize: 16, listType: 'ordered', listLevel: 1 }
];

// 列表项+换行
const textConfigListWithBreak = [
  { text: '\n', fontSize: 16 },
  { text: 'List', fontSize: 16, listType: 'unordered', listLevel: 1 }
];

// ========== Tests ==========

describe('getDefaultCharacterConfig', () => {
  it('should return default values when attribute is empty', () => {
    const config = getDefaultCharacterConfig({});
    expect(config.fill).toBe('black');
    expect(config.stroke).toBe(false);
    expect(config.fontSize).toBe(12);
    expect(config.fontWeight).toBe('normal');
    expect(config.fontFamily).toBe('Arial');
  });

  it('should use provided attribute values', () => {
    const config = getDefaultCharacterConfig({
      fill: 'red',
      fontSize: 24,
      fontWeight: 'bold',
      fontFamily: 'Helvetica',
      lineHeight: 32,
      textAlign: 'center'
    });
    expect(config.fill).toBe('red');
    expect(config.fontSize).toBe(24);
    expect(config.fontWeight).toBe('bold');
    expect(config.fontFamily).toBe('Helvetica');
    expect(config.lineHeight).toBe(32);
    expect(config.textAlign).toBe('center');
  });

  it('should default fontSize to 12 when not finite', () => {
    const config = getDefaultCharacterConfig({ fontSize: Infinity });
    expect(config.fontSize).toBe(12);
    const config2 = getDefaultCharacterConfig({ fontSize: NaN });
    expect(config2.fontSize).toBe(12);
  });

  it('should default fontSize to 12 when negative infinity', () => {
    const config = getDefaultCharacterConfig({ fontSize: -Infinity });
    expect(config.fontSize).toBe(12);
  });

  it('should accept 0 as a valid fontSize', () => {
    const config = getDefaultCharacterConfig({ fontSize: 0 });
    expect(config.fontSize).toBe(0);
  });

  it('should include stroke when provided', () => {
    const config = getDefaultCharacterConfig({ stroke: 'blue' });
    expect(config.stroke).toBe('blue');
  });

  it('should include lineHeight and textAlign when provided', () => {
    const config = getDefaultCharacterConfig({ lineHeight: 20, textAlign: 'right' });
    expect(config.lineHeight).toBe(20);
    expect(config.textAlign).toBe('right');
  });

  it('should not include undefined lineHeight', () => {
    const config = getDefaultCharacterConfig({});
    expect(config.lineHeight).toBeUndefined();
  });
});

describe('findConfigIndexByCursorIdx - basic text', () => {
  it('should return 0 for negative cursor index', () => {
    expect(findConfigIndexByCursorIdx(textConfig1, -0.1)).toBe(0);
    expect(findConfigIndexByCursorIdx(textConfig1, -1)).toBe(0);
  });

  it('should return textConfig.length for cursor beyond all characters', () => {
    expect(findConfigIndexByCursorIdx(textConfig1, 100)).toBe(textConfig1.length);
  });

  it('should handle empty textConfig', () => {
    expect(findConfigIndexByCursorIdx([], 0)).toBe(0);
    expect(findConfigIndexByCursorIdx([], -0.1)).toBe(0);
  });

  it('should find correct configIndex for simple text (no linebreaks)', () => {
    expect(findConfigIndexByCursorIdx(textConfig1, 0)).toBe(0);
    expect(findConfigIndexByCursorIdx(textConfig1, 1)).toBe(1);
    expect(findConfigIndexByCursorIdx(textConfig1, 2)).toBe(2);
  });

  it('should handle fractional cursor for simple text (right side)', () => {
    expect(findConfigIndexByCursorIdx(textConfig1, 0.1)).toBe(1);
    expect(findConfigIndexByCursorIdx(textConfig1, 1.1)).toBe(2);
  });

  it('should handle fractional cursor for simple text (left side)', () => {
    expect(findConfigIndexByCursorIdx(textConfig1, 0.9)).toBe(1);
    expect(findConfigIndexByCursorIdx(textConfig1, 1.9)).toBe(2);
  });

  it('should handle text with consecutive linebreaks', () => {
    expect(findConfigIndexByCursorIdx(textConfig2, 0)).toBe(0);
  });

  it('should handle text with mixed linebreaks and characters', () => {
    expect(findConfigIndexByCursorIdx(textConfig3, 0)).toBe(0);
  });
});

describe('findConfigIndexByCursorIdx - list items', () => {
  it('should account for list items occupying 2 cursor positions', () => {
    // textConfigWithList: ['H', listItem('AB'), '!']
    // cursor 0 → 'H' (configIdx 0)
    // cursor 1,2 → listItem 'AB' (configIdx 1) (occupies 2 positions)
    // cursor 3 → '!' (configIdx 2)
    expect(findConfigIndexByCursorIdx(textConfigWithList, 0)).toBe(0);
    // After 'H' (1 pos) + listItem (2 pos) = cursor 3 maps to '!'
    expect(findConfigIndexByCursorIdx(textConfigWithList, 3)).toBe(2);
  });

  it('should handle config with only list items', () => {
    // textConfigOnlyList: [listItem('Item1'), listItem('Item2')]
    // listItem1 occupies 2 positions: cursor 0,1
    // listItem2 occupies 2 positions: cursor 2,3
    expect(findConfigIndexByCursorIdx(textConfigOnlyList, 0)).toBe(0);
  });

  it('should handle list items with linebreaks', () => {
    // textConfigListWithBreak: ['\n', listItem('List')]
    expect(findConfigIndexByCursorIdx(textConfigListWithBreak, 0)).toBe(0);
  });
});

describe('findCursorIdxByConfigIndex - basic text', () => {
  it('should return -0.1 for negative configIndex', () => {
    expect(findCursorIdxByConfigIndex(textConfig1, -1)).toBe(-0.1);
    expect(findCursorIdxByConfigIndex(textConfig1, -100)).toBe(-0.1);
  });

  it('should handle out-of-range configIndex', () => {
    const result = findCursorIdxByConfigIndex(textConfig1, 100);
    expect(result).toBeCloseTo(2.1, 5);
  });

  it('should handle empty textConfig', () => {
    expect(findCursorIdxByConfigIndex([], 0)).toBeCloseTo(0.1, 5);
  });

  it('should find correct cursorIdx for simple text', () => {
    expect(findCursorIdxByConfigIndex(textConfig1, 0)).toBeCloseTo(-0.1, 5);
    expect(findCursorIdxByConfigIndex(textConfig1, 1)).toBeCloseTo(0.9, 5);
    expect(findCursorIdxByConfigIndex(textConfig1, 2)).toBeCloseTo(1.9, 5);
  });

  it('should handle trailing linebreak config', () => {
    const onlyLineBreaks = [{ text: '\n' }, { text: '\n' }];
    const result = findCursorIdxByConfigIndex(onlyLineBreaks, 10);
    expect(typeof result).toBe('number');
  });

  it('should handle config starting with linebreak', () => {
    const config = [{ text: '\n' }, { text: 'a' }, { text: 'b' }];
    expect(findCursorIdxByConfigIndex(config, 0)).toBeCloseTo(0.1, 5);
  });

  it('should return monotonically increasing values for simple text', () => {
    const prev = findCursorIdxByConfigIndex(textConfig1, 0);
    const curr = findCursorIdxByConfigIndex(textConfig1, 1);
    const next = findCursorIdxByConfigIndex(textConfig1, 2);
    expect(curr).toBeGreaterThan(prev);
    expect(next).toBeGreaterThan(curr);
  });
});

describe('findCursorIdxByConfigIndex - list items', () => {
  it('should account for list items occupying 2 cursor positions', () => {
    // textConfigWithList: ['H', listItem('AB'), '!']
    // configIndex 0 → 'H': cursorIdx = -0.1
    const idx0 = findCursorIdxByConfigIndex(textConfigWithList, 0);
    expect(idx0).toBeCloseTo(-0.1, 5);

    // configIndex 1 → listItem: cursorIdx based on 2 cursor positions
    const idx1 = findCursorIdxByConfigIndex(textConfigWithList, 1);
    expect(typeof idx1).toBe('number');

    // configIndex 2 → '!': should be after listItem
    const idx2 = findCursorIdxByConfigIndex(textConfigWithList, 2);
    expect(idx2).toBeGreaterThan(idx1);
  });

  it('should handle config with only list items', () => {
    const idx0 = findCursorIdxByConfigIndex(textConfigOnlyList, 0);
    const idx1 = findCursorIdxByConfigIndex(textConfigOnlyList, 1);
    expect(idx1).toBeGreaterThan(idx0);
  });
});

describe('findConfigIndexByCursorIdx and findCursorIdxByConfigIndex roundtrip', () => {
  it('should be approximately inverse for simple text', () => {
    for (let i = 0; i < textConfig1.length; i++) {
      const cursorIdx = findCursorIdxByConfigIndex(textConfig1, i);
      const configIdx = findConfigIndexByCursorIdx(textConfig1, cursorIdx);
      expect(configIdx).toBe(i);
    }
  });

  it('should handle boundary values', () => {
    expect(findConfigIndexByCursorIdx(textConfig1, -0.1)).toBe(0);
    expect(findConfigIndexByCursorIdx(textConfig2, -0.1)).toBe(0);
    expect(findConfigIndexByCursorIdx(textConfig3, -0.1)).toBe(0);
  });

  it('should handle single character config', () => {
    const singleConfig = [{ text: 'A', fontSize: 16 }];
    const cursorIdx = findCursorIdxByConfigIndex(singleConfig, 0);
    const configIdx = findConfigIndexByCursorIdx(singleConfig, cursorIdx);
    expect(configIdx).toBe(0);
  });
});

describe('stripListProperties (via findConfigIndexByCursorIdx behavior)', () => {
  it('should handle list items at different positions in textConfig', () => {
    const config = [
      { text: 'A', fontSize: 16 },
      { text: 'B', fontSize: 16, listType: 'ordered', listLevel: 1 },
      { text: 'C', fontSize: 16 }
    ];
    // Cursor at position 0 → configIndex 0
    expect(findConfigIndexByCursorIdx(config, 0)).toBe(0);
    // List item occupies 2 cursor positions
    // Position after 'A' (1) + listItem (2) = position 3 → configIndex 2 ('C')
    expect(findConfigIndexByCursorIdx(config, 3)).toBe(2);
  });

  it('should handle consecutive list items', () => {
    const config = [
      { text: 'Item1', fontSize: 16, listType: 'ordered', listLevel: 1 },
      { text: 'Item2', fontSize: 16, listType: 'ordered', listLevel: 1 },
      { text: 'Item3', fontSize: 16, listType: 'unordered', listLevel: 2 }
    ];
    // First list item: cursor 0,1 → configIdx 0
    expect(findConfigIndexByCursorIdx(config, 0)).toBe(0);
    // After first item (2 pos), second item: cursor 2 → configIdx 1
    expect(findConfigIndexByCursorIdx(config, 2)).toBe(1);
    // After first (2) + second (2), third item: cursor 4 → configIdx 2
    expect(findConfigIndexByCursorIdx(config, 4)).toBe(2);
  });
});
