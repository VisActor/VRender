import { getRichTextAttribute, mergeRowAttrs } from '../../../src/tooltip/util';

describe('tooltip/util', () => {
  test('mergeRowAttrs keeps nil values as merged result', () => {
    const res = mergeRowAttrs(
      { shape: undefined, key: undefined, value: undefined } as any,
      { shape: null, key: undefined, value: null } as any
    );

    expect(res.shape).toBeNull();
    expect(res.key).toBeUndefined();
    expect(res.value).toBeNull();
  });

  test('mergeRowAttrs merges sub objects', () => {
    const res = mergeRowAttrs(
      { shape: { size: 10, fill: 'red' } } as any,
      { shape: { fill: 'blue' } } as any,
      { shape: { stroke: 'black' } } as any
    );

    expect(res.shape).toEqual(expect.objectContaining({ size: 10, fill: 'blue', stroke: 'black' }));
  });

  test('getRichTextAttribute handles string array', () => {
    const attr = getRichTextAttribute({ width: 100, height: 20, text: ['a', 'b'] } as any) as any;
    expect(attr.singleLine).toBe(false);
    expect(attr.textConfig).toHaveLength(2);
    expect(attr.textConfig[0].text).toBe('a');
    expect(attr.textConfig[1].text).toBe('b');
    expect(attr.wordBreak).toBe('break-word');
  });

  test('getRichTextAttribute handles rich text config', () => {
    const rich = { type: 'rich', text: [{ text: 'x' }] };
    const attr = getRichTextAttribute({ width: 10, height: 10, text: rich } as any) as any;
    expect(attr.textConfig).toEqual(rich.text);
  });

  test('getRichTextAttribute returns undefined textConfig for plain string', () => {
    const attr = getRichTextAttribute({ width: 10, height: 10, text: 'hello' as any } as any) as any;
    expect(attr.textConfig).toBeUndefined();
  });
});
