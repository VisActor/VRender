declare const require: (id: string) => any;

describe('vrender-components util/text', () => {
  test('getTextType/isRichText respects type in attributes', () => {
    jest.resetModules();
    jest.doMock('@visactor/vrender-core', () => ({
      getTextBounds: jest.fn(),
      graphicCreator: {
        text: jest.fn(),
        richtext: jest.fn()
      }
    }));

    jest.isolateModules(() => {
      const { getTextType, isRichText } = require('../../../src/util/text');

      expect(getTextType({ text: { type: 'rich' } })).toBe('rich');
      expect(isRichText({ text: { type: 'rich' } })).toBe(true);

      expect(getTextType({ type: 'html', text: 'a' })).toBe('html');
      expect(getTextType({ text: 'a' })).toBe('text');
    });
  });

  test('attribute transforms and createTextGraphicByType routing', () => {
    jest.resetModules();

    const textMock = jest.fn().mockReturnValue({ kind: 'text' });
    const richMock = jest.fn().mockReturnValue({ kind: 'rich' });

    jest.doMock('@visactor/vrender-core', () => ({
      getTextBounds: jest.fn(() => ({ width: () => 10, height: () => 5 })),
      graphicCreator: {
        text: textMock,
        richtext: richMock
      }
    }));

    jest.isolateModules(() => {
      const {
        richTextAttributeTransform,
        htmlAttributeTransform,
        reactAttributeTransform,
        createTextGraphicByType,
        alignTextInLine
      } = require('../../../src/util/text');

      const richAttrs: any = { maxLineWidth: 100, text: { text: [{ text: 'a' }] } };
      const out = richTextAttributeTransform(richAttrs);
      expect(out.maxWidth).toBe(100);
      expect(out.maxLineWidth).toBeUndefined();
      expect(out.width).toBe(0);
      expect(out.height).toBe(0);
      expect(out.textConfig).toEqual([{ text: 'a' }]);

      const htmlAttrs: any = { text: { text: '<div />' }, _originText: 'origin' };
      htmlAttributeTransform(htmlAttrs);
      expect(htmlAttrs.html).toBe('<div />');
      expect(htmlAttrs.text).toBe('origin');
      expect(htmlAttrs.renderable).toBe(false);

      const reactAttrs: any = { text: { text: 'ReactNode' }, _originText: 'origin' };
      reactAttributeTransform(reactAttrs);
      expect(reactAttrs.react).toBe('ReactNode');
      expect(reactAttrs.text).toBe('origin');
      expect(reactAttrs.renderable).toBe(false);

      expect(createTextGraphicByType({ text: { type: 'rich', text: [] } } as any)).toEqual({ kind: 'rich' });
      expect(richMock).toHaveBeenCalled();

      expect(createTextGraphicByType({ type: 'html', text: { text: '<p />' }, _originText: 'o' } as any)).toEqual({
        kind: 'text'
      });
      expect(textMock).toHaveBeenCalled();

      const g: any = { setAttribute: jest.fn() };
      alignTextInLine('right', g, 'center', 100, 20);
      expect(g.setAttribute).toHaveBeenCalledWith('x', 90);
      alignTextInLine('left', g, 'end', 100, 20);
      expect(g.setAttribute).toHaveBeenCalledWith('x', 120);
    });
  });
});
