import { OrderedObjParser } from '../../../../src/common/xml/OrderedObjParser';
import { prettify } from '../../../../src/common/xml/node2json';

describe('common/xml/OrderedObjParser', () => {
  test('parses self closing tag with numeric attributes', () => {
    const parser = new OrderedObjParser({} as any);
    const res = parser.parseXml('<a x="1" y="2" />');
    const pretty: any = prettify(res as any, {} as any);

    // Depending on compress result shape, tag name should exist.
    expect(pretty.a).toBeTruthy();
    expect(pretty.a.x).toBe(1);
    expect(pretty.a.y).toBe(2);
  });

  test('parses boolean attribute as true', () => {
    const parser = new OrderedObjParser({} as any);
    const res = parser.parseXml('<a disabled />');
    const pretty: any = prettify(res as any, {} as any);

    expect(pretty.a.disabled).toBe(true);
  });

  test('parses string attribute and text content', () => {
    const parser = new OrderedObjParser({} as any);
    const res = parser.parseXml('<root><a name="foo" x="1">bar</a></root>');
    const pretty: any = prettify(res as any, {} as any);

    expect(pretty.root.a.name).toBe('foo');
    expect(pretty.root.a.x).toBe(1);
    expect(pretty.root.a.text).toBe('bar');
  });

  test('supports single quote attributes and tab separators', () => {
    const parser = new OrderedObjParser({} as any);
    const res = parser.parseXml("<a\tx='3'\tname='foo'/> ");
    const pretty: any = prettify(res as any, {} as any);

    expect(pretty.a.x).toBe(3);
    expect(pretty.a.name).toBe('foo');
  });

  test('repeated tags become array after prettify', () => {
    const parser = new OrderedObjParser({} as any);
    const res = parser.parseXml('<root><a/><a/></root>');
    const pretty: any = prettify(res as any, {} as any);

    expect(Array.isArray(pretty.root.a)).toBe(true);
    expect(pretty.root.a.length).toBe(2);
  });

  test('xml instruction and comment are ignored', () => {
    const parser = new OrderedObjParser({} as any);
    const res = parser.parseXml('<?xml version="1.0"?><root><!--c--><a/></root>');
    const pretty: any = prettify(res as any, {} as any);

    expect(pretty.root.a).toBeTruthy();
  });

  test('__proto__ tagname is sanitized', () => {
    const parser = new OrderedObjParser({} as any);
    const res = parser.parseXml('<root><__proto__ x="1"/></root>');
    const pretty: any = prettify(res as any, {} as any);

    expect(({} as any).x).toBeUndefined();
    expect(pretty.root['#__proto__']).toBeTruthy();
  });

  test('throws when comment is not closed', () => {
    const parser = new OrderedObjParser({} as any);

    expect(() => parser.parseXml('<root><!--oops</root>')).toThrow('Comment is not closed.');
  });

  test('throws when closing tag is not closed', () => {
    const parser = new OrderedObjParser({} as any);

    expect(() => parser.parseXml('<a></a')).toThrow('Closing Tag is not closed.');
  });
});
