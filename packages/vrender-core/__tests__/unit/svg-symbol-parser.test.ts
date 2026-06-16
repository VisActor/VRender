import { Symbol } from '../../src/graphic/symbol';

describe('svg symbol parser', () => {
  it('parses inline svg symbolType without runtime require', () => {
    const symbol = new Symbol({
      size: 20,
      symbolType:
        '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M524.66 101.57H498c-116.06 0-210.15 94.09-210.15 210.15v383.44c0 123.23 100.25 223.48 223.48 223.48s223.48-100.25 223.48-223.48V311.72c0.01-116.06-94.08-210.15-210.15-210.15z" />' +
        '</svg>'
    });

    expect(() => symbol.getParsedPath()).not.toThrow();
    expect(symbol.getParsedPath()).toBeTruthy();
  });
});
