import { XMLParser, isSvg, isXML } from '../../../../src/common/xml/parser';
import { isXML as isXMLFromIndex } from '../../../../src/common/xml';

describe('common/xml/parser', () => {
  test('isXML checks startsWith("<") without trim', () => {
    expect(isXML('<a/>')).toBe(true);
    expect(isXML('  <a/>')).toBe(false);
    expect(isXML('abc')).toBe(false);
  });

  test('index.ts re-exports parser APIs', () => {
    expect(isXMLFromIndex('<a/>')).toBe(true);
  });

  test('isSvg detects <svg and <?xml prefix', () => {
    expect(isSvg('<svg></svg>')).toBe(true);
    expect(isSvg('<?xml version="1.0"?><svg />')).toBe(true);
    expect(isSvg('<a></a>')).toBe(false);
  });

  test('XMLParser.valid works for basic strings', () => {
    const parser = new XMLParser();
    expect(parser.valid('<a/>')).toBe(true);
    expect(parser.valid('abc')).toBe(false);
  });

  test('XMLParser.parse parses simple xml', () => {
    const parser = new XMLParser();
    const res = parser.parse('<root><a x="1"/></root>');
    expect(res).toBeTruthy();
  });

  test('XMLParser.parse returns false when valid is missing', () => {
    const parser: any = new XMLParser();
    parser.valid = undefined;

    expect(parser.parse('<a/>')).toBe(false);
  });
});
