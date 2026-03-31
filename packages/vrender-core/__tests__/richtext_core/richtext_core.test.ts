/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

// We cannot import RichText directly due to downstream TS errors in wrapper.ts,
// so we replicate the static method logic for testing.
// These are exact copies of the static methods from RichText class.

import { isString } from '@visactor/vutils';

let supportIntl = false;
try {
  supportIntl = Intl && typeof (Intl as any).Segmenter === 'function';
} catch (e) {
  supportIntl = false;
}

function splitText(text: string) {
  if (supportIntl) {
    const segmenter = new (Intl as any).Segmenter(undefined, { granularity: 'grapheme' });
    const segments = [];
    for (const { segment } of segmenter.segment(text)) {
      segments.push(segment);
    }
    return segments;
  }
  return Array.from(text);
}

function AllSingleCharacter(cache: any) {
  if (cache.lines) {
    const frame = cache;
    return frame.lines.every(line =>
      line.paragraphs.every(item => !(item.text && isString(item.text) && splitText(item.text).length > 1))
    );
  }
  const tc = cache;
  return tc.every(item => item.isComposing || !(item.text && isString(item.text) && splitText(item.text).length > 1));
}

function TransformTextConfig2SingleCharacter(textConfig: any[]) {
  const tc = [];
  textConfig.forEach((item: any) => {
    if ('listType' in item) {
      const listItem = item;
      const textStr = `${listItem.text}`;
      const textList = splitText(textStr);
      if (textList.length <= 1) {
        tc.push(item);
      } else {
        tc.push({ ...listItem, text: textList[0] });
        const plainConfig = { ...listItem };
        delete plainConfig.listType;
        delete plainConfig.listLevel;
        delete plainConfig.listIndex;
        delete plainConfig.listMarker;
        delete plainConfig.listIndentPerLevel;
        delete plainConfig.markerColor;
        for (let i = 1; i < textList.length; i++) {
          tc.push({ ...plainConfig, text: textList[i] });
        }
      }
      return;
    }
    const textList = splitText(item.text.toString());
    if (isString(item.text) && textList.length > 1) {
      for (let i = 0; i < textList.length; i++) {
        const t = textList[i];
        tc.push({ ...item, text: t });
      }
    } else {
      tc.push(item);
    }
  });
  return tc;
}

// ========== splitText ==========

describe('splitText', () => {
  it('should split ASCII text into individual characters', () => {
    const result = splitText('abc');
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('should return single element for single character', () => {
    expect(splitText('a')).toEqual(['a']);
  });

  it('should return empty array for empty string', () => {
    expect(splitText('')).toEqual([]);
  });

  it('should handle CJK characters', () => {
    const result = splitText('你好世界');
    expect(result).toEqual(['你', '好', '世', '界']);
  });

  it('should handle mixed ASCII and CJK', () => {
    const result = splitText('a你b好');
    expect(result).toEqual(['a', '你', 'b', '好']);
  });

  it('should handle whitespace characters', () => {
    const result = splitText('a b');
    expect(result).toEqual(['a', ' ', 'b']);
  });

  it('should handle newline characters', () => {
    const result = splitText('a\nb');
    expect(result).toEqual(['a', '\n', 'b']);
  });
});

// ========== AllSingleCharacter ==========

describe('AllSingleCharacter', () => {
  describe('with textConfig array', () => {
    it('should return true when all items have single character text', () => {
      const tc = [
        { text: 'a', fontSize: 16 },
        { text: 'b', fontSize: 16 },
        { text: 'c', fontSize: 16 }
      ];
      expect(AllSingleCharacter(tc)).toBe(true);
    });

    it('should return false when item has multi-character text', () => {
      const tc = [
        { text: 'ab', fontSize: 16 },
        { text: 'c', fontSize: 16 }
      ];
      expect(AllSingleCharacter(tc)).toBe(false);
    });

    it('should return true for empty textConfig', () => {
      expect(AllSingleCharacter([])).toBe(true);
    });

    it('should return true when item has numeric text', () => {
      const tc = [{ text: 5, fontSize: 16 }];
      expect(AllSingleCharacter(tc)).toBe(true);
    });

    it('should return true when item has empty string text', () => {
      const tc = [{ text: '', fontSize: 16 }];
      expect(AllSingleCharacter(tc)).toBe(true);
    });

    it('should skip items with isComposing flag', () => {
      const tc = [
        { text: 'hello', fontSize: 16, isComposing: true },
        { text: 'a', fontSize: 16 }
      ];
      expect(AllSingleCharacter(tc)).toBe(true);
    });

    it('should return false for multi-char text with listType', () => {
      const tc = [{ text: 'Hello', fontSize: 16, listType: 'unordered' }];
      expect(AllSingleCharacter(tc)).toBe(false);
    });

    it('should return true for single-char text with listType', () => {
      const tc = [{ text: 'H', fontSize: 16, listType: 'unordered' }];
      expect(AllSingleCharacter(tc)).toBe(true);
    });
  });

  describe('with frame cache (lines)', () => {
    it('should return true when all paragraphs have single character', () => {
      const cache = {
        lines: [
          {
            paragraphs: [{ text: 'a' }, { text: 'b' }]
          }
        ]
      };
      expect(AllSingleCharacter(cache)).toBe(true);
    });

    it('should return false when paragraph has multi-character text', () => {
      const cache = {
        lines: [
          {
            paragraphs: [{ text: 'ab' }, { text: 'c' }]
          }
        ]
      };
      expect(AllSingleCharacter(cache)).toBe(false);
    });

    it('should return true for empty lines', () => {
      const cache = { lines: [] };
      expect(AllSingleCharacter(cache)).toBe(true);
    });

    it('should check across multiple lines', () => {
      const cache = {
        lines: [{ paragraphs: [{ text: 'a' }] }, { paragraphs: [{ text: 'bc' }] }]
      };
      expect(AllSingleCharacter(cache)).toBe(false);
    });

    it('should return true for line with empty paragraphs', () => {
      const cache = {
        lines: [{ paragraphs: [] }]
      };
      expect(AllSingleCharacter(cache)).toBe(true);
    });
  });
});

// ========== TransformTextConfig2SingleCharacter ==========

describe('TransformTextConfig2SingleCharacter', () => {
  it('should split multi-character text into single character configs', () => {
    const tc = [{ text: 'abc', fontSize: 16, fill: 'red' }];
    const result = TransformTextConfig2SingleCharacter(tc);
    expect(result).toEqual([
      { text: 'a', fontSize: 16, fill: 'red' },
      { text: 'b', fontSize: 16, fill: 'red' },
      { text: 'c', fontSize: 16, fill: 'red' }
    ]);
  });

  it('should not change single character configs', () => {
    const tc = [
      { text: 'a', fontSize: 16 },
      { text: 'b', fontSize: 16 }
    ];
    const result = TransformTextConfig2SingleCharacter(tc);
    expect(result).toEqual(tc);
  });

  it('should handle empty textConfig', () => {
    expect(TransformTextConfig2SingleCharacter([])).toEqual([]);
  });

  it('should not split numeric text (non-string)', () => {
    const tc = [{ text: 123, fontSize: 16 }];
    const result = TransformTextConfig2SingleCharacter(tc);
    // Numeric text is converted via toString() but isString check fails, so it stays as-is
    expect(result.length).toBe(1);
    expect(result[0].text).toBe(123);
  });

  it('should preserve all style properties when splitting', () => {
    const tc = [{ text: 'ab', fontSize: 24, fill: 'blue', fontWeight: 'bold', lineHeight: 30 }];
    const result = TransformTextConfig2SingleCharacter(tc);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ text: 'a', fontSize: 24, fill: 'blue', fontWeight: 'bold', lineHeight: 30 });
    expect(result[1]).toEqual({ text: 'b', fontSize: 24, fill: 'blue', fontWeight: 'bold', lineHeight: 30 });
  });

  it('should handle mixed single and multi character configs', () => {
    const tc = [
      { text: 'a', fontSize: 16 },
      { text: 'bc', fontSize: 16 },
      { text: 'd', fontSize: 16 }
    ];
    const result = TransformTextConfig2SingleCharacter(tc);
    expect(result).toHaveLength(4);
    expect(result.map(r => r.text)).toEqual(['a', 'b', 'c', 'd']);
  });

  describe('list item handling', () => {
    it('should split list item text into single chars', () => {
      const tc = [{ text: 'Hello', fontSize: 16, listType: 'unordered', listLevel: 1 }];
      const result = TransformTextConfig2SingleCharacter(tc);
      expect(result).toHaveLength(5);
      // First char keeps list properties
      expect(result[0].text).toBe('H');
      expect(result[0].listType).toBe('unordered');
      expect(result[0].listLevel).toBe(1);
      // Subsequent chars lose list properties
      expect(result[1].text).toBe('e');
      expect(result[1].listType).toBeUndefined();
      expect(result[1].listLevel).toBeUndefined();
    });

    it('should not split single-char list item', () => {
      const tc = [{ text: 'H', fontSize: 16, listType: 'ordered', listLevel: 2 }];
      const result = TransformTextConfig2SingleCharacter(tc);
      expect(result).toHaveLength(1);
      expect(result[0].listType).toBe('ordered');
    });

    it('should remove all list-related properties from subsequent chars', () => {
      const tc = [
        {
          text: 'AB',
          fontSize: 16,
          listType: 'ordered',
          listLevel: 2,
          listIndex: 5,
          listMarker: '→',
          listIndentPerLevel: 30,
          markerColor: 'red'
        }
      ];
      const result = TransformTextConfig2SingleCharacter(tc);
      expect(result).toHaveLength(2);
      // First char keeps all list properties
      expect(result[0].listType).toBe('ordered');
      expect(result[0].listLevel).toBe(2);
      expect(result[0].listIndex).toBe(5);
      expect(result[0].listMarker).toBe('→');
      expect(result[0].listIndentPerLevel).toBe(30);
      expect(result[0].markerColor).toBe('red');
      // Second char has no list properties
      expect(result[1].listType).toBeUndefined();
      expect(result[1].listLevel).toBeUndefined();
      expect(result[1].listIndex).toBeUndefined();
      expect(result[1].listMarker).toBeUndefined();
      expect(result[1].listIndentPerLevel).toBeUndefined();
      expect(result[1].markerColor).toBeUndefined();
      // But keeps other style properties
      expect(result[1].fontSize).toBe(16);
    });

    it('should handle mixed list and non-list items', () => {
      const tc = [
        { text: 'AB', fontSize: 16, listType: 'unordered' },
        { text: 'CD', fontSize: 16 }
      ];
      const result = TransformTextConfig2SingleCharacter(tc);
      expect(result).toHaveLength(4);
      expect(result[0].listType).toBe('unordered');
      expect(result[1].listType).toBeUndefined();
      expect(result[2].listType).toBeUndefined();
      expect(result[3].listType).toBeUndefined();
    });
  });
});
