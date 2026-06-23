import { Symbol as VRenderSymbol } from '../../../src/graphic/symbol';
import { xul } from '../../../src/graphic/tools';

describe('graphic xml parser boundary', () => {
  test('xul should parse xml richtext attributes', () => {
    const config = xul('<tc><text attribute="fontSize:12;fill:#333">hello</text></tc>');

    expect(config).toHaveLength(1);
    expect(config[0]).toMatchObject({
      fontSize: 12,
      fill: '#333'
    });
  });

  test('symbol should parse svg symbol strings', () => {
    const symbol = new VRenderSymbol({
      symbolType: '<svg><path d="M0 0L10 0L10 10Z" fill="#f00"/></svg>',
      size: 10
    });
    const parsedPath = symbol.getParsedPath() as any;

    expect(parsedPath.isSvg).toBe(true);
    expect(parsedPath.svgCache).toHaveLength(1);
    expect(parsedPath.svgCache[0].attribute).toMatchObject({
      fill: '#f00'
    });
    expect(parsedPath.svgCache[0].path.commandList.length).toBeGreaterThan(0);
  });
});
