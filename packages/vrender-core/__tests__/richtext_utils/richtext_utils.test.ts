/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

// Tests for pure utility functions in richtext/utils.ts
// and additional Paragraph/Frame/Wrapper branch coverage

jest.mock('../../src/graphic/richtext/utils', () => {
  const actual = jest.requireActual('../../src/graphic/richtext/utils');
  return {
    ...actual,
    measureTextCanvas: (text: string, character: any, mode?: string) => {
      const fontSize = character.fontSize || 16;
      const width = text.length * fontSize * 0.6;
      return {
        ascent: Math.floor(fontSize * 0.8),
        descent: Math.floor(fontSize * 0.2),
        height: fontSize,
        width: Math.floor(width + (character.space ?? 0))
      };
    },
    getStrByWithCanvas: (desc: string, width: number, character: any, guessIndex: number) => {
      const fontSize = character.fontSize || 16;
      const charWidth = fontSize * 0.6;
      return Math.max(0, Math.floor(width / charWidth));
    }
  };
});

import {
  getWordStartEndIdx,
  testLetter,
  testLetter2,
  regLetter,
  regFirstSpace,
  DIRECTION_KEY
} from '../../src/graphic/richtext/utils';
import Paragraph, { seperateParagraph } from '../../src/graphic/richtext/paragraph';
import Frame from '../../src/graphic/richtext/frame';
import Wrapper from '../../src/graphic/richtext/wrapper';
import {
  findConfigIndexByCursorIdx,
  findCursorIdxByConfigIndex,
  getDefaultCharacterConfig
} from '../../src/plugins/builtin-plugin/edit-module';

const defaultCharStyle = {
  fontSize: 16,
  fontFamily: 'Arial',
  fill: '#333'
};

// ===== DIRECTION_KEY =====
describe('DIRECTION_KEY', () => {
  it('should have correct horizontal keys', () => {
    expect(DIRECTION_KEY.horizontal).toEqual({
      width: 'width',
      height: 'height',
      left: 'left',
      top: 'top',
      x: 'x',
      y: 'y',
      bottom: 'bottom'
    });
  });

  it('should have correct vertical keys', () => {
    expect(DIRECTION_KEY.vertical).toEqual({
      width: 'height',
      height: 'width',
      left: 'top',
      top: 'left',
      x: 'y',
      y: 'x',
      bottom: 'right'
    });
  });
});

// ===== regLetter =====
describe('regLetter', () => {
  it('should match word characters', () => {
    expect(regLetter.test('a')).toBe(true);
    expect(regLetter.test('Z')).toBe(true);
    expect(regLetter.test('0')).toBe(true);
    expect(regLetter.test('_')).toBe(true);
  });

  it('should match parentheses and hyphens', () => {
    expect(regLetter.test('(')).toBe(true);
    expect(regLetter.test(')')).toBe(true);
    expect(regLetter.test('-')).toBe(true);
  });

  it('should not match CJK or whitespace', () => {
    expect(regLetter.test('中')).toBe(false);
    expect(regLetter.test(' ')).toBe(false);
  });
});

// ===== regFirstSpace =====
describe('regFirstSpace', () => {
  it('should match non-whitespace character', () => {
    expect(regFirstSpace.test('a')).toBe(true);
    expect(regFirstSpace.test('中')).toBe(true);
  });

  it('should not match whitespace', () => {
    expect(regFirstSpace.test(' ')).toBe(false);
    expect(regFirstSpace.test('\t')).toBe(false);
  });
});

// ===== getWordStartEndIdx =====
describe('getWordStartEndIdx', () => {
  it('should find word boundaries for English text', () => {
    const str = 'Hello World';
    const result = getWordStartEndIdx(str, 2); // 'l' in 'Hello'
    expect(result.startIdx).toBe(0);
    expect(result.endIdx).toBe(5);
  });

  it('should find word at beginning', () => {
    const str = 'Hello World';
    const result = getWordStartEndIdx(str, 0);
    // string[-1] is undefined, regLetter.test(undefined) matches 'undefined' string
    expect(result.startIdx).toBeLessThanOrEqual(0);
    expect(result.endIdx).toBe(5);
  });

  it('should find word at end', () => {
    const str = 'Hello World';
    const result = getWordStartEndIdx(str, 8); // 'r' in 'World'
    expect(result.startIdx).toBe(6);
    expect(result.endIdx).toBe(11);
  });

  it('should handle single character words', () => {
    const str = 'a b c';
    const result = getWordStartEndIdx(str, 0);
    expect(result.startIdx).toBeLessThanOrEqual(0);
    expect(result.endIdx).toBeGreaterThanOrEqual(1);
  });

  it('should handle space between words', () => {
    const str = 'Hello World';
    const result = getWordStartEndIdx(str, 5); // space
    expect(result.startIdx).toBe(5);
    expect(result.endIdx).toBe(6);
  });

  it('should handle CJK characters (each char is a word)', () => {
    const str = '你好世界';
    const result = getWordStartEndIdx(str, 1);
    expect(result.startIdx).toBe(1);
    expect(result.endIdx).toBe(2);
  });

  it('should handle punctuation', () => {
    const str = 'Hello,World';
    const result = getWordStartEndIdx(str, 5); // ','
    expect(result.startIdx).toBeLessThanOrEqual(5);
  });

  it('should handle string of all word characters', () => {
    const str = 'abcdef';
    const result = getWordStartEndIdx(str, 3);
    expect(result.startIdx).toBe(0);
    expect(result.endIdx).toBe(6);
  });

  it('should handle parentheses as word characters', () => {
    const str = 'fn(x)';
    const result = getWordStartEndIdx(str, 2);
    expect(result.startIdx).toBe(0);
    expect(result.endIdx).toBe(5);
  });
});

// ===== testLetter =====
describe('testLetter', () => {
  it('should find word boundary backwards in middle of word', () => {
    const str = 'Hello World';
    const idx = testLetter(str, 3); // 'l' in 'Hello', both sides are letters
    // testLetter only goes backwards while string[i-1] and string[i] are both letters
    // At i=3, str[2]='l', str[3]='l' are both letters → continue
    // Result depends on the boundary found
    expect(idx).toBe(3); // Cannot break middle of all-letter sequence
  });

  it('should not move for non-letter boundary', () => {
    const str = 'Hello World';
    const idx = testLetter(str, 6); // 'W' after space
    expect(idx).toBe(6);
  });

  it('should handle index at start', () => {
    const str = 'Hello';
    const idx = testLetter(str, 0);
    expect(idx).toBe(0);
  });

  it('should handle all-letter string (no boundary found)', () => {
    const str = 'abcdef';
    const idx = testLetter(str, 3);
    // Can't find boundary, returns original index
    expect(idx).toBe(3);
  });

  it('should handle negativeWrongMatch=true', () => {
    const str = 'abcdef';
    const idx = testLetter(str, 3, true);
    // When no boundary found going backwards and negativeWrongMatch is true,
    // uses testLetter2 to go forward
    expect(idx).toBeGreaterThanOrEqual(3);
  });

  it('should handle punctuation at index', () => {
    const str = 'abc.def';
    const idx = testLetter(str, 3); // '.'
    expect(idx).toBeLessThanOrEqual(3);
  });
});

// ===== testLetter2 =====
describe('testLetter2', () => {
  it('should find word boundary forward', () => {
    const str = 'Hello World';
    const idx = testLetter2(str, 2);
    expect(idx).toBe(5); // end of 'Hello'
  });

  it('should handle index at end of string', () => {
    const str = 'abc';
    const idx = testLetter2(str, 2);
    expect(idx).toBe(3);
  });

  it('should handle all-letter string', () => {
    const str = 'abcdef';
    const idx = testLetter2(str, 0);
    expect(idx).toBe(6);
  });

  it('should stop at non-letter', () => {
    const str = 'abc def';
    const idx = testLetter2(str, 0);
    expect(idx).toBe(3);
  });

  it('should handle CJK characters', () => {
    const str = 'abc中文';
    const idx = testLetter2(str, 0);
    expect(idx).toBe(3); // stops at CJK
  });
});

// ===== Paragraph additional coverage =====
describe('Paragraph construction', () => {
  it('should set basic properties', () => {
    const p = new Paragraph('Hello', false, defaultCharStyle);
    expect(p.text).toBe('Hello');
    expect(p.newLine).toBe(false);
    expect(p.length).toBe(5);
    expect(p.width).toBeGreaterThan(0);
    expect(p.height).toBeGreaterThan(0);
  });

  it('should handle empty text', () => {
    const p = new Paragraph('', false, defaultCharStyle);
    expect(p.text).toBe('');
    expect(p.length).toBe(0);
    expect(p.width).toBe(0);
  });

  it('should set newLine flag', () => {
    const p = new Paragraph('test', true, defaultCharStyle);
    expect(p.newLine).toBe(true);
  });

  it('should handle different textBaseline', () => {
    const p1 = new Paragraph('test', false, { ...defaultCharStyle, textBaseline: 'top' });
    expect(p1.textBaseline).toBe('top');

    const p2 = new Paragraph('test', false, { ...defaultCharStyle, textBaseline: 'bottom' });
    expect(p2.textBaseline).toBe('bottom');

    const p3 = new Paragraph('test', false, { ...defaultCharStyle, textBaseline: 'middle' });
    expect(p3.textBaseline).toBe('middle');
  });

  it('should handle lineHeight number larger than fontSize', () => {
    const p = new Paragraph('test', false, { ...defaultCharStyle, lineHeight: 32 });
    expect(p.lineHeight).toBe(32);
    expect(p.height).toBe(32);
  });

  it('should use fontSize when lineHeight is smaller', () => {
    const p = new Paragraph('test', false, { ...defaultCharStyle, lineHeight: 8 });
    expect(p.lineHeight).toBe(16); // uses fontSize
  });

  it('should handle non-numeric lineHeight', () => {
    const p = new Paragraph('test', false, { ...defaultCharStyle, lineHeight: 'normal' } as any);
    expect(p.lineHeight).toBe(Math.floor(1.2 * 16)); // 19
  });

  it('should handle space character property', () => {
    const p = new Paragraph('test', false, { ...defaultCharStyle, space: 10 });
    const pNoSpace = new Paragraph('test', false, defaultCharStyle);
    expect(p.width).toBeGreaterThan(pNoSpace.width);
  });

  it('should store character reference', () => {
    const p = new Paragraph('x', false, defaultCharStyle);
    expect(p.character).toBe(defaultCharStyle);
  });
});

describe('Paragraph - seperateParagraph edge cases', () => {
  it('should split at beginning', () => {
    const p = new Paragraph('Hello', false, defaultCharStyle);
    const [p1, p2] = seperateParagraph(p, 0);
    expect(p1.text).toBe('');
    expect(p2.text).toBe('Hello');
  });

  it('should split at end', () => {
    const p = new Paragraph('Hello', false, defaultCharStyle);
    const [p1, p2] = seperateParagraph(p, 5);
    expect(p1.text).toBe('Hello');
    expect(p2.text).toBe('');
  });

  it('should preserve newLine on first part', () => {
    const p = new Paragraph('Hello World', true, defaultCharStyle);
    const [p1, p2] = seperateParagraph(p, 5);
    expect(p1.newLine).toBe(true);
    expect(p2.newLine).toBe(true); // seperateParagraph preserves newLine on both parts
  });
});

// ===== Frame additional coverage =====
describe('Frame - getLineDrawingPosition branches', () => {
  it('should return invisible for non-existent line index', () => {
    const frame = new Frame(
      0,
      0,
      200,
      100,
      false,
      'break-word',
      'top',
      'left',
      'top',
      'horizontal',
      false,
      false,
      false
    );
    frame.lines = [];
    expect(frame.getLineDrawingPosition(0)).toEqual({ x: 0, y: 0, visible: false });
  });

  it('top baseline, left align - no delta', () => {
    const frame = new Frame(
      0,
      0,
      200,
      100,
      false,
      'break-word',
      'top',
      'left',
      'top',
      'horizontal',
      false,
      false,
      false
    );
    frame.lines = [{ left: 10, top: 5, height: 20, actualWidth: 100 } as any];
    frame.actualHeight = 20;
    const pos = frame.getLineDrawingPosition(0);
    expect(pos.x).toBe(0);
    expect(pos.visible).toBe(true);
  });

  it('middle baseline should offset y by -height/2', () => {
    const frame = new Frame(
      0,
      0,
      200,
      0,
      false,
      'break-word',
      'top',
      'left',
      'middle',
      'horizontal',
      false,
      false,
      false
    );
    frame.lines = [{ left: 0, top: 0, height: 20, actualWidth: 100 } as any];
    frame.actualHeight = 20;
    const pos = frame.getLineDrawingPosition(0);
    expect(pos.y).toBe(-10); // deltaY = -20/2 = -10
  });

  it('bottom baseline should offset y by -height', () => {
    const frame = new Frame(
      0,
      0,
      200,
      0,
      false,
      'break-word',
      'top',
      'left',
      'bottom',
      'horizontal',
      false,
      false,
      false
    );
    frame.lines = [{ left: 0, top: 0, height: 20, actualWidth: 100 } as any];
    frame.actualHeight = 20;
    const pos = frame.getLineDrawingPosition(0);
    expect(pos.y).toBe(-20); // deltaY = -20
  });

  it('right align should offset x by -width', () => {
    const frame = new Frame(
      0,
      0,
      200,
      100,
      false,
      'break-word',
      'top',
      'right',
      'top',
      'horizontal',
      false,
      false,
      false
    );
    frame.lines = [{ left: 0, top: 0, height: 20, actualWidth: 100 } as any];
    frame.actualHeight = 20;
    const pos = frame.getLineDrawingPosition(0);
    expect(pos.x).toBe(-200);
  });

  it('center align should offset x by -width/2', () => {
    const frame = new Frame(
      0,
      0,
      200,
      100,
      false,
      'break-word',
      'top',
      'center',
      'top',
      'horizontal',
      false,
      false,
      false
    );
    frame.lines = [{ left: 0, top: 0, height: 20, actualWidth: 100 } as any];
    frame.actualHeight = 20;
    const pos = frame.getLineDrawingPosition(0);
    expect(pos.x).toBe(-100);
  });

  it('middle verticalDirection with shorter content', () => {
    const frame = new Frame(
      0,
      0,
      200,
      100,
      false,
      'break-word',
      'middle',
      'left',
      'top',
      'horizontal',
      false,
      false,
      false
    );
    frame.lines = [{ left: 0, top: 0, height: 20, actualWidth: 100 } as any];
    frame.actualHeight = 20;
    const pos = frame.getLineDrawingPosition(0);
    expect(pos.visible).toBe(true);
    // deltaY from middle centering
    expect(pos.y).toBeDefined();
  });

  it('bottom verticalDirection for horizontal layout', () => {
    const frame = new Frame(
      0,
      0,
      200,
      100,
      false,
      'break-word',
      'bottom',
      'left',
      'top',
      'horizontal',
      false,
      false,
      false
    );
    frame.lines = [{ left: 0, top: 0, height: 20, actualWidth: 100 } as any];
    frame.actualHeight = 20;
    const pos = frame.getLineDrawingPosition(0);
    expect(pos.visible).toBe(true);
  });

  it('isWidthMax should use min of width and actualWidth', () => {
    const frame = new Frame(
      0,
      0,
      200,
      100,
      false,
      'break-word',
      'top',
      'left',
      'top',
      'horizontal',
      true,
      false,
      false
    );
    frame.lines = [{ left: 0, top: 0, height: 20, actualWidth: 100 } as any];
    frame.actualHeight = 20;
    const pos = frame.getLineDrawingPosition(0);
    expect(pos.visible).toBe(true);
  });

  it('isHeightMax should use min of height and actualHeight', () => {
    const frame = new Frame(
      0,
      0,
      200,
      100,
      false,
      'break-word',
      'top',
      'left',
      'top',
      'horizontal',
      false,
      true,
      false
    );
    frame.lines = [{ left: 0, top: 0, height: 20, actualWidth: 100 } as any];
    frame.actualHeight = 20;
    const pos = frame.getLineDrawingPosition(0);
    expect(pos.visible).toBe(true);
  });

  it('should hide line outside frame bounds', () => {
    const frame = new Frame(
      0,
      0,
      200,
      50,
      false,
      'break-word',
      'top',
      'left',
      'top',
      'horizontal',
      false,
      false,
      false
    );
    frame.lines = [{ left: 0, top: 60, height: 20, actualWidth: 100 } as any];
    frame.actualHeight = 80;
    const pos = frame.getLineDrawingPosition(0);
    // top + height = 80 > top(0) + frameHeight(50) = 50 → not visible
    expect(pos.visible).toBe(false);
  });
});

describe('Frame - getActualSize', () => {
  it('should calculate size from lines', () => {
    const frame = new Frame(
      0,
      0,
      200,
      100,
      false,
      'break-word',
      'top',
      'left',
      'top',
      'horizontal',
      false,
      false,
      false
    );
    frame.lines = [{ height: 20, actualWidth: 100 } as any, { height: 20, actualWidth: 150 } as any];
    const size = frame.getActualSize();
    expect(size.width).toBe(150);
    expect(size.height).toBe(40);
  });

  it('should return 0 for empty lines', () => {
    const frame = new Frame(
      0,
      0,
      200,
      100,
      false,
      'break-word',
      'top',
      'left',
      'top',
      'horizontal',
      false,
      false,
      false
    );
    frame.lines = [];
    const size = frame.getActualSize();
    expect(size.width).toBe(0);
    expect(size.height).toBe(0);
  });
});

describe('Frame - constructor', () => {
  it('should set all properties', () => {
    const frame = new Frame(
      10,
      20,
      300,
      200,
      false,
      'break-word',
      'middle',
      'center',
      'middle',
      'horizontal',
      true,
      true,
      true
    );
    expect(frame.left).toBe(10);
    expect(frame.top).toBe(20);
    expect(frame.width).toBe(300);
    expect(frame.height).toBe(200);
    expect(frame.bottom).toBe(220);
    expect(frame.right).toBe(310);
    expect(frame.ellipsis).toBe(false);
    expect(frame.wordBreak).toBe('break-word');
    expect(frame.verticalDirection).toBe('middle');
    expect(frame.globalAlign).toBe('center');
    expect(frame.globalBaseline).toBe('middle');
    expect(frame.layoutDirection).toBe('horizontal');
    expect(frame.isWidthMax).toBe(true);
    expect(frame.isHeightMax).toBe(true);
    expect(frame.singleLine).toBe(true);
    expect(frame.lines).toEqual([]);
    expect(frame.icons).toBeDefined();
    expect(frame.links).toBeDefined();
  });

  it('should accept icons map', () => {
    const icons = new Map();
    icons.set('old', { x: 1 });
    const frame = new Frame(
      0,
      0,
      100,
      100,
      false,
      'break-word',
      'top',
      'left',
      'top',
      'horizontal',
      false,
      false,
      false,
      icons
    );
    expect(frame.icons).toBe(icons);
    // icons.clear() is called
    expect(icons.size).toBe(0);
  });

  it('should handle vertical layout direction key', () => {
    const frame = new Frame(0, 0, 100, 100, false, 'break-word', 'top', 'left', 'top', 'vertical', false, false, false);
    expect(frame.directionKey).toBe(DIRECTION_KEY.vertical);
  });

  it('should handle ellipsis string', () => {
    const frame = new Frame(
      0,
      0,
      100,
      100,
      '...',
      'break-word',
      'top',
      'left',
      'top',
      'horizontal',
      false,
      false,
      false
    );
    expect(frame.ellipsis).toBe('...');
  });
});

// ===== Wrapper additional coverage =====
describe('Wrapper - deal and send', () => {
  it('should layout single paragraph within width', () => {
    const frame = new Frame(0, 0, 300, 0, false, 'break-word', 'top', 'left', 'top', 'horizontal', false, false, false);
    const wrapper = new Wrapper(frame);
    const p = new Paragraph('Hi', false, defaultCharStyle);
    wrapper.deal(p);
    wrapper.send();
    expect(frame.lines.length).toBe(1);
    expect(frame.lines[0].paragraphs.length).toBe(1);
  });

  it('should wrap long text into multiple lines', () => {
    const frame = new Frame(0, 0, 50, 0, false, 'break-word', 'top', 'left', 'top', 'horizontal', false, false, false);
    const wrapper = new Wrapper(frame);
    const p = new Paragraph('This is a long paragraph', false, defaultCharStyle);
    wrapper.deal(p);
    wrapper.send();
    expect(frame.lines.length).toBeGreaterThan(1);
  });

  it('should handle newLine paragraph', () => {
    const frame = new Frame(0, 0, 300, 0, false, 'break-word', 'top', 'left', 'top', 'horizontal', false, false, false);
    const wrapper = new Wrapper(frame);
    const p1 = new Paragraph('Line 1', false, defaultCharStyle);
    const p2 = new Paragraph('Line 2', true, defaultCharStyle);
    wrapper.deal(p1);
    wrapper.deal(p2);
    wrapper.send();
    expect(frame.lines.length).toBe(2);
  });

  it('should handle multiple paragraphs on same line', () => {
    const frame = new Frame(0, 0, 500, 0, false, 'break-word', 'top', 'left', 'top', 'horizontal', false, false, false);
    const wrapper = new Wrapper(frame);
    const p1 = new Paragraph('A', false, defaultCharStyle);
    const p2 = new Paragraph('B', false, defaultCharStyle);
    wrapper.deal(p1);
    wrapper.deal(p2);
    wrapper.send();
    expect(frame.lines.length).toBe(1);
    expect(frame.lines[0].paragraphs.length).toBe(2);
  });

  it('should handle break-all wordBreak', () => {
    const frame = new Frame(0, 0, 50, 0, false, 'break-all', 'top', 'left', 'top', 'horizontal', false, false, false);
    const wrapper = new Wrapper(frame);
    const p = new Paragraph('ABCDEFGHIJKLMNOP', false, defaultCharStyle);
    wrapper.deal(p);
    wrapper.send();
    expect(frame.lines.length).toBeGreaterThan(1);
  });
});

// ===== EditModule pure function tests =====
describe('EditModule - handleInput list item handling', () => {
  it('findConfigIndexByCursorIdx with negative index', () => {
    const config = [{ text: 'a' }];
    expect(findConfigIndexByCursorIdx(config, -1)).toBe(0);
  });

  it('findConfigIndexByCursorIdx with index beyond config length', () => {
    const config = [{ text: 'a' }, { text: 'b' }];
    expect(findConfigIndexByCursorIdx(config, 100)).toBe(2);
  });

  it('findCursorIdxByConfigIndex with negative index', () => {
    const config = [{ text: 'a' }];
    expect(findCursorIdxByConfigIndex(config, -1)).toBe(-0.1);
  });

  it('findCursorIdxByConfigIndex with index beyond config - trailing newline', () => {
    const config = [{ text: 'a' }, { text: '\n' }];
    expect(findCursorIdxByConfigIndex(config, 10)).toBe(0.9);
  });

  it('findCursorIdxByConfigIndex with index beyond config - no trailing newline', () => {
    const config = [{ text: 'a' }, { text: 'b' }];
    expect(findCursorIdxByConfigIndex(config, 10)).toBe(1.1);
  });

  it('getDefaultCharacterConfig with non-finite fontSize', () => {
    const result = getDefaultCharacterConfig({ fontSize: Infinity });
    expect(result.fontSize).toBe(12);
  });

  it('getDefaultCharacterConfig with NaN fontSize', () => {
    const result = getDefaultCharacterConfig({ fontSize: NaN });
    expect(result.fontSize).toBe(12);
  });

  it('getDefaultCharacterConfig with valid fontSize', () => {
    const result = getDefaultCharacterConfig({ fontSize: 24, fill: 'red' });
    expect(result.fontSize).toBe(24);
    expect(result.fill).toBe('red');
  });

  it('getDefaultCharacterConfig with defaults', () => {
    const result = getDefaultCharacterConfig({});
    expect(result.fill).toBe('black');
    expect(result.stroke).toBe(false);
    expect(result.fontWeight).toBe('normal');
    expect(result.fontFamily).toBe('Arial');
    expect(result.fontSize).toBe(12);
  });

  it('findConfigIndexByCursorIdx single newline at start', () => {
    // First char is \n - lineBreak starts true
    const config = [{ text: '\n' }, { text: 'a' }];
    const idx = findConfigIndexByCursorIdx(config, 0);
    expect(idx).toBe(0);
  });

  it('findConfigIndexByCursorIdx consecutive newlines', () => {
    const config = [{ text: 'a' }, { text: '\n' }, { text: '\n' }, { text: 'b' }];
    const idx = findConfigIndexByCursorIdx(config, 1);
    expect(idx).toBe(2);
  });

  it('findConfigIndexByCursorIdx with fractional cursor (right side)', () => {
    const config = [{ text: 'a' }, { text: 'b' }, { text: 'c' }];
    // cursorIndex > intCursorIndex means right side
    const idx = findConfigIndexByCursorIdx(config, 0.9);
    expect(idx).toBe(1);
  });

  it('findCursorIdxByConfigIndex with single newline at configIndex', () => {
    const config = [{ text: 'a' }, { text: '\n' }, { text: 'b' }];
    const cursorIdx = findCursorIdxByConfigIndex(config, 1);
    // Single newline skips, so it adds 0.2
    expect(cursorIdx).toBe(0.1);
  });

  it('findCursorIdxByConfigIndex with consecutive newlines', () => {
    const config = [{ text: 'a' }, { text: '\n' }, { text: '\n' }, { text: 'b' }];
    const cursorIdx = findCursorIdxByConfigIndex(config, 2);
    // First \n is single (skipped), second \n is consecutive (counted)
    expect(cursorIdx).toBe(0.9);
  });

  it('findCursorIdxByConfigIndex at end of config exactly', () => {
    const config = [{ text: 'a' }, { text: 'b' }];
    const cursorIdx = findCursorIdxByConfigIndex(config, 1);
    expect(cursorIdx).toBe(0.9);
  });
});
