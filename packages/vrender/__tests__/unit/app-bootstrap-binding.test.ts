/**
 * @jest-environment node
 */

declare const require: any;
export {};

describe('app-scoped bootstrap binding context', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('acquireSharedVRenderApp keeps runtime renderer bindings after legacy graphic registration', () => {
    jest.isolateModules(() => {
      const { registerLine } = require('@visactor/vrender-kits/register/register-line');

      registerLine();

      const { acquireSharedVRenderApp } = require('../../src/entries/shared');
      const handle = acquireSharedVRenderApp({ env: 'browser', key: Symbol('legacy-line-first') });

      expect(handle.app.registry.renderer.getAll().length).toBeGreaterThan(0);
      expect(handle.app.registry.picker.getAll().length).toBeGreaterThan(0);

      handle.release();
    });
  });

  test('acquireSharedVRenderApp bootstraps browser defaults without legacy renderer gaps', () => {
    jest.isolateModules(() => {
      const { acquireSharedVRenderApp } = require('../../src/entries/shared');
      const handle = acquireSharedVRenderApp({ env: 'browser', key: Symbol('browser-defaults') });

      expect(handle.app.registry.renderer.getAll().length).toBeGreaterThan(0);
      expect(handle.app.registry.picker.getAll().length).toBeGreaterThan(0);

      handle.release();
    });
  });

  test('createNodeVRenderApp keeps arc renderer selected after default graphics bootstrap', () => {
    jest.isolateModules(() => {
      const { createArc, createNodeVRenderApp } = require('../../src');
      const app = createNodeVRenderApp({
        envParams: {
          createCanvas: () => ({
            getContext: () => ({}),
            getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 })
          }),
          createImageData: (data: Uint8ClampedArray, width: number, height?: number) => ({
            data,
            width,
            height: height ?? data.length / width / 4
          }),
          loadImage: jest.fn()
        }
      });

      const arc = createArc({ x: 0, y: 0, outerRadius: 10, startAngle: 0, endAngle: Math.PI });
      const rendererByNumberType = new Map(
        app.registry.renderer.getAll().map((renderer: any) => [renderer.numberType, renderer])
      );

      expect(rendererByNumberType.get(arc.numberType)?.constructor.name).toBe('DefaultCanvasArcRender');

      app.release();
    });
  });

  test('createBrowserVRenderApp preserves caller-owned registries during bootstrap', () => {
    jest.isolateModules(() => {
      const {
        ContributionRegistry,
        DrawItemInterceptor,
        PickerRegistry,
        PluginRegistry,
        RendererRegistry,
        createBrowserVRenderApp
      } = require('../../src');

      const rendererRegistry = new RendererRegistry();
      const pickerRegistry = new PickerRegistry();
      const contributionRegistry = new ContributionRegistry();
      const pluginRegistry = new PluginRegistry();
      const customRenderer = { type: 'custom-renderer' };
      const customPicker = { type: 'custom-picker' };
      const customDrawInterceptor = { type: 'custom-draw-interceptor' };

      rendererRegistry.register('custom-renderer', customRenderer);
      pickerRegistry.register('custom-picker', customPicker);
      contributionRegistry.register(DrawItemInterceptor, customDrawInterceptor);

      const app = createBrowserVRenderApp({
        context: {
          registry: {
            renderer: rendererRegistry,
            picker: pickerRegistry,
            contribution: contributionRegistry,
            plugin: pluginRegistry
          }
        }
      });

      expect(app.registry.renderer.get('custom-renderer')).toBe(customRenderer);
      expect(app.registry.picker.get('custom-picker')).toBe(customPicker);
      expect(app.context.registry.contribution.get(DrawItemInterceptor)).toContain(customDrawInterceptor);

      app.release();
    });
  });

  test('picker installers replace VRender-owned entries without clearing caller-owned picker', () => {
    jest.isolateModules(() => {
      const {
        ContributionRegistry,
        PickerRegistry,
        PluginRegistry,
        RendererRegistry,
        createBrowserApp,
        installBrowserPickersToApp,
        installDefaultGraphicsToApp,
        installMathPickersToApp
      } = require('../../src');

      const pickerRegistry = new PickerRegistry();
      const customPicker = { type: 'custom-picker', numberType: -1 };
      const app = createBrowserApp({
        context: {
          registry: {
            renderer: new RendererRegistry(),
            picker: pickerRegistry,
            contribution: new ContributionRegistry(),
            plugin: new PluginRegistry()
          }
        }
      });

      pickerRegistry.register('custom-picker', customPicker);

      installDefaultGraphicsToApp(app);
      installBrowserPickersToApp(app);
      const browserOwnedPickers = app.registry.picker.getAll().filter((picker: any) => picker !== customPicker);

      expect(browserOwnedPickers.length).toBeGreaterThan(0);

      installMathPickersToApp(app);

      const installedPickers = app.registry.picker.getAll();
      expect(installedPickers).toContain(customPicker);
      expect(installedPickers.some((picker: any) => browserOwnedPickers.includes(picker))).toBe(false);

      app.release();
    });
  });

  test.each([
    ['area', '@visactor/vrender-kits/register/register-area', 'registerArea'],
    ['circle', '@visactor/vrender-kits/register/register-circle', 'registerCircle'],
    ['glyph', '@visactor/vrender-kits/register/register-glyph', 'registerGlyph']
  ])(
    'acquireSharedVRenderApp keeps runtime %s renderer binding after legacy registration',
    (_, moduleName, exportName) => {
      jest.isolateModules(() => {
        const register = require(moduleName)[exportName];

        register();

        const { acquireSharedVRenderApp } = require('../../src/entries/shared');
        const handle = acquireSharedVRenderApp({ env: 'browser', key: Symbol(`${exportName}-first`) });

        expect(handle.app.registry.renderer.getAll().length).toBeGreaterThan(0);
        expect(handle.app.registry.picker.getAll().length).toBeGreaterThan(0);

        handle.release();
      });
    }
  );

  test.each([
    ['line', '@visactor/vrender-kits/register/register-line', 'registerLine'],
    ['area', '@visactor/vrender-kits/register/register-area', 'registerArea'],
    ['circle', '@visactor/vrender-kits/register/register-circle', 'registerCircle'],
    ['glyph', '@visactor/vrender-kits/register/register-glyph', 'registerGlyph']
  ])(
    'acquireSharedBrowserLiteVRenderApp keeps runtime %s renderer binding after legacy registration',
    (_, moduleName, exportName) => {
      jest.isolateModules(() => {
        const register = require(moduleName)[exportName];

        register();

        const { acquireSharedBrowserLiteVRenderApp } = require('../../src/entries/shared-browser-lite');
        const handle = acquireSharedBrowserLiteVRenderApp({ env: 'browser', key: Symbol(`${exportName}-lite-first`) });

        expect(handle.app.registry.renderer.getAll().length).toBeGreaterThan(0);
        expect(handle.app.registry.picker.getAll().length).toBeGreaterThan(0);

        handle.release();
      });
    }
  );
});
