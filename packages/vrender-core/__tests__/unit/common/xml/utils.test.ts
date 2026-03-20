import { getAllMatches } from '../../../../src/common/xml/utils';

describe('common/xml/utils', () => {
  test('getAllMatches returns matches with startIndex', () => {
    const matches = getAllMatches('a1 b2 c3', /\w\d/g);

    expect(matches.length).toBe(3);
    expect(matches[0][0]).toBe('a1');
    expect(matches[0].startIndex).toBe(0);
    expect(matches[1][0]).toBe('b2');
    expect(matches[1].startIndex).toBe(3);
  });
});
