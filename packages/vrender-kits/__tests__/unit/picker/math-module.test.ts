describe('picker/math-module', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('bindMathPicker binds/rebinds correctly', () => {
    jest.isolateModules(() => {
      const toDynamicValue = jest.fn(() => ({ inSingletonScope: jest.fn() }));
      const bind = jest.fn(() => ({
        toDynamicValue,
        toSelf: () => ({ inSingletonScope: jest.fn() }),
        toService: jest.fn()
      }));
      const rebind = jest.fn(() => ({ toService: jest.fn() }));

      jest.doMock('@visactor/vrender-core', () => ({
        PickItemInterceptor: 'PickItemInterceptor',
        PickServiceInterceptor: 'PickServiceInterceptor',
        PickerService: 'PickerService',
        createContributionProvider: jest.fn()
      }));

      jest.doMock('../../../src/picker/math-picker-service', () => ({
        DefaultMathPickerService: class DefaultMathPickerService {}
      }));

      const bindMathPickerContribution = jest.fn();
      jest.doMock('../../../src/picker/contributions/math-picker/module', () => ({
        bindMathPickerContribution
      }));
      const bindArcMathPickerContribution = jest.fn();
      const bindAreaMathPickerContribution = jest.fn();
      const bindCircleMathPickerContribution = jest.fn();
      const bindGlyphMathPickerContribution = jest.fn();
      const bindImageMathPickerContribution = jest.fn();
      const bindLineMathPickerContribution = jest.fn();
      const bindPolygonMathPickerContribution = jest.fn();
      const bindPathMathPickerContribution = jest.fn();
      const bindRectMathPickerContribution = jest.fn();
      const bindRichTextMathPickerContribution = jest.fn();
      const bindSymbolMathPickerContribution = jest.fn();
      const bindTextMathPickerContribution = jest.fn();
      jest.doMock('../../../src/picker/contributions/math-picker/arc-module', () => ({
        bindArcMathPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/area-module', () => ({
        bindAreaMathPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/circle-module', () => ({
        bindCircleMathPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/glyph-module', () => ({
        bindGlyphMathPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/image-module', () => ({
        bindImageMathPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/line-module', () => ({
        bindLineMathPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/polygon-module', () => ({
        bindPolygonMathPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/path-module', () => ({
        bindPathMathPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/rect-module', () => ({
        bindRectMathPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/richtext-module', () => ({
        bindRichTextMathPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/symbol-module', () => ({
        bindSymbolMathPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/text-module', () => ({
        bindTextMathPickerContribution
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/arc-module', () => ({
        arcMathPickModule: { id: 'arc' }
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/area-module', () => ({
        areaMathPickModule: { id: 'area' }
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/circle-module', () => ({
        circleMathPickModule: { id: 'circle' }
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/glyph-module', () => ({
        glyphMathPickModule: { id: 'glyph' }
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/image-module', () => ({
        imageMathPickModule: { id: 'image' }
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/line-module', () => ({
        lineMathPickModule: { id: 'line' }
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/polygon-module', () => ({
        polygonMathPickModule: { id: 'polygon' }
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/path-module', () => ({
        pathMathPickModule: { id: 'path' }
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/rect-module', () => ({
        rectMathPickModule: { id: 'rect' }
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/richtext-module', () => ({
        richTextMathPickModule: { id: 'richtext' }
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/symbol-module', () => ({
        symbolMathPickModule: { id: 'symbol' }
      }));
      jest.doMock('../../../src/picker/contributions/math-picker/text-module', () => ({
        textMathPickModule: { id: 'text' }
      }));

      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const mod = require('../../../src/picker/math-module');
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const DefaultMathPickerService = require('../../../src/picker/math-picker-service').DefaultMathPickerService;

      mod.bindMathPicker({
        bind,
        rebind,
        load: jest.fn(),
        isBound: (token: any) => token === 'PickerService'
      });

      expect(bind).toHaveBeenCalledWith(DefaultMathPickerService);
      expect(rebind).toHaveBeenCalledWith('PickerService');
      expect(toDynamicValue).toHaveBeenCalledTimes(1);
    });
  });

  test('loadMathPicker loads modules and binds picker service explicitly', () => {
    jest.isolateModules(() => {
      jest.doMock('@visactor/vrender-core', () => ({
        PickerService: 'PickerService'
      }));

      jest.doMock('../../../src/picker/math-picker-service', () => ({
        DefaultMathPickerService: class DefaultMathPickerService {}
      }));

      const bindMathPickerContribution = jest.fn();
      jest.doMock('../../../src/picker/contributions/math-picker/module', () => ({
        bindMathPickerContribution
      }));
      const leafBindMocks = [
        ['../../../src/picker/contributions/math-picker/arc-module', 'bindArcMathPickerContribution'],
        ['../../../src/picker/contributions/math-picker/area-module', 'bindAreaMathPickerContribution'],
        ['../../../src/picker/contributions/math-picker/circle-module', 'bindCircleMathPickerContribution'],
        ['../../../src/picker/contributions/math-picker/glyph-module', 'bindGlyphMathPickerContribution'],
        ['../../../src/picker/contributions/math-picker/image-module', 'bindImageMathPickerContribution'],
        ['../../../src/picker/contributions/math-picker/line-module', 'bindLineMathPickerContribution'],
        ['../../../src/picker/contributions/math-picker/polygon-module', 'bindPolygonMathPickerContribution'],
        ['../../../src/picker/contributions/math-picker/path-module', 'bindPathMathPickerContribution'],
        ['../../../src/picker/contributions/math-picker/rect-module', 'bindRectMathPickerContribution'],
        ['../../../src/picker/contributions/math-picker/richtext-module', 'bindRichTextMathPickerContribution'],
        ['../../../src/picker/contributions/math-picker/symbol-module', 'bindSymbolMathPickerContribution'],
        ['../../../src/picker/contributions/math-picker/text-module', 'bindTextMathPickerContribution']
      ] as const;
      const leafBindFns = leafBindMocks.map(([path, key]) => {
        const fn = jest.fn();
        jest.doMock(path, () => ({ [key]: fn }));
        return fn;
      });

      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { loadMathPicker } = require('../../../src/picker/math-module');

      const c = {
        bind: jest.fn(() => ({
          toDynamicValue: () => ({ inSingletonScope: jest.fn() }),
          toSelf: () => ({ inSingletonScope: jest.fn() }),
          toService: jest.fn()
        })),
        rebind: jest.fn(() => ({ toService: jest.fn() })),
        isBound: jest.fn(() => false),
        load: jest.fn()
      };
      loadMathPicker(c as any);

      expect(bindMathPickerContribution).toHaveBeenCalledWith(c);
      leafBindFns.forEach(fn => {
        expect(fn).toHaveBeenCalledWith(c);
      });
      expect(c.load).toHaveBeenCalledTimes(0);
      expect(c.bind).toHaveBeenCalled();
    });
  });
});
