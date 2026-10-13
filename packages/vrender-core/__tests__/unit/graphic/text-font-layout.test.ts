import { application } from '../../../src/application';
import type { IGraphicUtil, TextOptionsType } from '../../../src/interface';
import { ATextMeasure } from '../../../src/core/contributions/textMeasure/AtextMeasure';
import { DefaultGraphicService } from '../../../src/graphic/graphic-service/graphic-service';
import { createText } from '../../../src/graphic/text';
import { createWrapText } from '../../../src/graphic/wrap-text';
import { createGroup } from '../../../src/graphic/group';

describe('text layout uses the rendered font', () => {
  const graphicUtil = application.graphicUtil;
  const graphicService = application.graphicService;

  beforeEach(() => {
    let font: TextOptionsType = {};
    // 使用确定的字体宽度隔离宿主字体差异，仍经过真实 ATextMeasure 的截断和测量算法。
    const context = {
      setTextStyleWithoutAlignBaseline: (options: TextOptionsType) => (font = options),
      measureText: (text: string) => {
        const advance = font.fontVariant === 'small-caps' ? 20 : font.fontStyle === 'italic' ? 15 : 10;
        const width = text.length * advance;
        return {
          width,
          actualBoundingBoxAscent: 16,
          actualBoundingBoxDescent: 4,
          fontBoundingBoxAscent: 16,
          fontBoundingBoxDescent: 4
        };
      }
    };
    const measure = new ATextMeasure();
    measure.configure({ context, bindTextMeasure: (): void => undefined } as unknown as IGraphicUtil, 'browser');
    application.graphicUtil = { getTextMeasureInstance: () => measure } as unknown as IGraphicUtil;
    application.graphicService = new DefaultGraphicService();
  });

  afterEach(() => {
    application.graphicUtil = graphicUtil;
    application.graphicService = graphicService;
  });

  function wrapped(attributes = {}, create = createText) {
    const text = create({
      text: 'abcdefgh',
      fontFamily: 'Arial',
      fontSize: 20,
      lineHeight: 20,
      whiteSpace: 'normal',
      wordBreak: 'break-all',
      maxLineWidth: 55,
      ...attributes
    });
    return text;
  }

  test.each([createText, createWrapText])('wraps small-caps at the available width (%#)', create => {
    const text = wrapped({ fontVariant: 'small-caps' }, create);
    expect(text.multilineLayout.lines.map(line => line.str)).toEqual(['ab', 'cd', 'ef', 'gh']);
    expect(text.multilineLayout.lines.map(line => line.width)).toEqual([40, 40, 40, 40]);
  });

  test('measures explicit lines with the configured font', () => {
    const text = createText({ text: ['abcd', 'ab'], fontSize: 20, fontVariant: 'small-caps' });
    expect(text.multilineLayout.lines.map(line => line.width)).toEqual([80, 40]);
  });

  test('clips a single line including its suffix using the configured font', () => {
    const text = createText({
      text: 'abcdefgh',
      fontSize: 20,
      fontVariant: 'small-caps',
      maxLineWidth: 100,
      ellipsis: '...'
    });
    expect(text.clipedText).toBe('ab...');
    expect(text.clipedWidth).toBe(100);
  });

  test.each([createText, createWrapText])('invalidates wrapped layout when the variant changes (%#)', create => {
    const text = wrapped({}, create);
    expect(text.multilineLayout.lines.map(line => line.str)).toEqual(['abcde', 'fgh']);
    text.setAttribute('fontVariant', 'small-caps');
    expect(text.multilineLayout.lines.map(line => line.str)).toEqual(['ab', 'cd', 'ef', 'gh']);
    text.setAttributes({ fontVariant: '' });
    expect(text.multilineLayout.lines.map(line => line.str)).toEqual(['abcde', 'fgh']);
  });

  test.each([createText, createWrapText])('invalidates wrapped layout when the style changes (%#)', create => {
    const text = wrapped({}, create);
    expect(text.multilineLayout.lines.map(line => line.str)).toEqual(['abcde', 'fgh']);
    text.setAttributes({ fontStyle: 'italic' });
    expect(text.multilineLayout.lines.map(line => line.str)).toEqual(['abc', 'def', 'gh']);
    expect(text.multilineLayout.lines.map(line => line.width)).toEqual([45, 45, 30]);
  });

  test.each([createText, createWrapText])('recomputes layout when entering and leaving a font state (%#)', create => {
    const text = wrapped({}, create);
    text.states = { caps: { fontVariant: 'small-caps' } };
    expect(text.multilineLayout.lines.map(line => line.str)).toEqual(['abcde', 'fgh']);
    text.useStates(['caps'], false);
    expect(text.multilineLayout.lines.map(line => line.str)).toEqual(['ab', 'cd', 'ef', 'gh']);
    text.useStates([], false);
    expect(text.multilineLayout.lines.map(line => line.str)).toEqual(['abcde', 'fgh']);
  });

  test('inherits the font variant from the group theme while respecting an explicit override', () => {
    const group = createGroup({});
    group.setTheme({ text: { fontVariant: 'small-caps' } });
    const inherited = wrapped();
    const overridden = wrapped({ fontVariant: '' });
    group.add(inherited);
    group.add(overridden);
    expect(inherited.multilineLayout.lines.map(line => line.str)).toEqual(['ab', 'cd', 'ef', 'gh']);
    expect(overridden.multilineLayout.lines.map(line => line.str)).toEqual(['abcde', 'fgh']);
  });

  test('measures vertical Latin text with the configured font', () => {
    const text = createText({ text: 'abcd', direction: 'vertical', fontSize: 20, fontVariant: 'small-caps' });
    expect(text.AABBBounds.height()).toBe(80);
  });
});
