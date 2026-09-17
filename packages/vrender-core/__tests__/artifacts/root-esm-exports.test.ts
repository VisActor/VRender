/**
 * @jest-environment node
 */

declare const __dirname: string;
declare const require: any;
export {};

const fs = require('fs');
const path = require('path');
const packageRoot = path.resolve(__dirname, '../..');

describe('vrender-core published root exports', () => {
  test('keeps BytePack-sensitive root runtime exports explicit in the ESM artifact', () => {
    const artifact = fs.readFileSync(path.join(packageRoot, 'es/index.js'), 'utf8');
    const explicitExports = new Set<string>();
    const exportPattern = /export\s+\{([^}]+)\}/g;
    let match: RegExpExecArray | null;

    while ((match = exportPattern.exec(artifact))) {
      match[1]
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean)
        .forEach((specifier: string) => {
          const exportedName = specifier.match(/\s+as\s+([A-Za-z0-9_$]+)$/)?.[1] ?? specifier;
          explicitExports.add(exportedName.trim());
        });
    }

    const expectedExplicitRuntimeExports = [
      'CustomEvent',
      'CustomPath2D',
      'GradientParser',
      'IContainPointMode',
      'Symbol',
      'builtInSymbolStrMap',
      'builtinSymbols',
      'builtinSymbolsMap',
      'container',
      'createArc',
      'createArc3d',
      'createArea',
      'createGlyph',
      'createGroup',
      'createImage',
      'createLine',
      'createPath',
      'createPolygon',
      'createPyramid3d',
      'createRect',
      'createRect3d',
      'createRichText',
      'createSymbol',
      'createText',
      'getRichTextBounds',
      'getTextBounds',
      'graphicCreator',
      'isBrowserEnv',
      'mapToCanvasPointForCanvas',
      'matrixAllocate',
      'registerDirectionalLight',
      'registerGlobalEventTransformer',
      'registerHtmlAttributePlugin',
      'registerOrthoCamera',
      'registerReactAttributePlugin',
      'registerViewTransform3dPlugin',
      'registerWindowEventTransformer',
      'transformPointForCanvas',
      'vglobal',
      'waitForAllSubLayers'
    ];

    expect(expectedExplicitRuntimeExports.filter(name => !explicitExports.has(name))).toEqual([]);

    expect(artifact).toContain('export { Symbol, createSymbol } from "./graphic/symbol"');
    expect(artifact).toContain(
      'export { builtInSymbolStrMap, builtinSymbols, builtinSymbolsMap } from "./graphic/builtin-symbol"'
    );
  });
});
