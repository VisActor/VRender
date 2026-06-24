/**
 * @jest-environment node
 */

import type { createLegacyBindingContext } from '../../../src/legacy/binding-context';

declare const require: any;

describe('runtime contribution installer', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  function createMockApp() {
    return {
      registry: {
        renderer: {
          register: jest.fn(),
          unregister: jest.fn()
        },
        picker: {
          register: jest.fn(),
          unregister: jest.fn()
        }
      },
      context: {
        registry: {
          contribution: {
            get: jest.fn(() => []),
            register: jest.fn(),
            unregister: jest.fn()
          },
          plugin: {}
        }
      }
    };
  }

  test('loads the same module once per binding context while allowing repeated app installation', () => {
    jest.isolateModules(() => {
      const { installRuntimeContributionModule } =
        require('../../../src/entries/runtime-installer') as typeof import('../../../src/entries/runtime-installer');

      const app = createMockApp();
      const module = {
        registry: jest.fn()
      };

      installRuntimeContributionModule(module, { app: app as any, targets: ['graphic-renderer'] });
      const firstRegisterCount = app.registry.renderer.register.mock.calls.length;

      installRuntimeContributionModule(module, { app: app as any, targets: ['graphic-renderer'] });

      expect(module.registry).toHaveBeenCalledTimes(2);
      expect(firstRegisterCount).toBeGreaterThan(0);
      expect(app.registry.renderer.register.mock.calls.length).toBeGreaterThan(firstRegisterCount);
    });
  });

  test('accepts function modules for runtime state before an app exists', () => {
    jest.isolateModules(() => {
      const { getRuntimeInstallerBindingContext, installRuntimeContributionModule } =
        require('../../../src/entries/runtime-installer') as typeof import('../../../src/entries/runtime-installer');

      const Token = Symbol('runtime-test-token');
      const module = jest.fn((context: ReturnType<typeof createLegacyBindingContext>) => {
        context.bind(Token).toConstantValue('installed');
      });

      installRuntimeContributionModule(module);

      expect(module).toHaveBeenCalledTimes(2);
      expect(getRuntimeInstallerBindingContext().getAll(Token)).toEqual(['installed']);
    });
  });

  test('refreshes renderer contribution providers after replacing a bound contribution token', () => {
    jest.isolateModules(() => {
      const {
        getRuntimeInstallerBindingContext,
        installRuntimeContributionModule,
        installRuntimeGraphicRenderersToApp
      } = require('../../../src/entries/runtime-installer') as typeof import('../../../src/entries/runtime-installer');
      const { BaseRenderContributionTime } =
        require('../../../src/common/enums') as typeof import('../../../src/common/enums');
      const { rectModule } =
        require('../../../src/render/contributions/render/rect-module') as typeof import('../../../src/render/contributions/render/rect-module');
      const { GraphicRender } =
        require('../../../src/render/contributions/render/symbol') as typeof import('../../../src/render/contributions/render/symbol');
      const { RectRenderContribution } =
        require('../../../src/render/contributions/render/contributions/constants') as typeof import('../../../src/render/contributions/render/contributions/constants');
      const { SplitRectAfterRenderContribution, SplitRectBeforeRenderContribution } =
        require('../../../src/render/contributions/render/contributions/rect-contribution-render') as typeof import('../../../src/render/contributions/render/contributions/rect-contribution-render');
      const { createContributionProvider } =
        require('../../../src/common/contribution-provider') as typeof import('../../../src/common/contribution-provider');

      class VTableSplitRectBeforeRenderContribution {
        time = BaseRenderContributionTime.beforeFillStroke;
        useStyle = true;
        order = 0;
        drawShape(): void {
          return undefined;
        }
      }

      class VTableSplitRectAfterRenderContribution {
        time = BaseRenderContributionTime.afterFillStroke;
        useStyle = true;
        order = 0;
        drawShape(): void {
          return undefined;
        }
      }

      const rendererEntries = new Map<string, unknown>();
      const app = {
        registry: {
          renderer: {
            register: jest.fn((key: string, renderer: unknown) => {
              rendererEntries.set(key, renderer);
            }),
            unregister: jest.fn((key: string) => {
              rendererEntries.delete(key);
            }),
            getAll: jest.fn(() => Array.from(rendererEntries.values()))
          },
          picker: {
            register: jest.fn(),
            unregister: jest.fn()
          }
        },
        context: {
          registry: {
            contribution: {
              get: jest.fn(() => []),
              register: jest.fn(),
              unregister: jest.fn()
            },
            plugin: {}
          }
        }
      };
      const runtimeContext = getRuntimeInstallerBindingContext();
      rectModule({ bind: runtimeContext.bind });
      installRuntimeGraphicRenderersToApp(app as any);
      const cachedRectRenderer = runtimeContext.getAll<any>(GraphicRender).find(renderer => renderer.type === 'rect');

      expect(cachedRectRenderer?._renderContribitions.map((item: unknown) => item.constructor.name)).toContain(
        'SplitRectAfterRenderContribution'
      );
      createContributionProvider(RectRenderContribution, runtimeContext);

      const module = {
        registry(bind: any, unbind: any, isBound: any, rebind: any) {
          if (isBound(SplitRectBeforeRenderContribution)) {
            rebind(SplitRectBeforeRenderContribution).to(VTableSplitRectBeforeRenderContribution).inSingletonScope();
          } else {
            bind(VTableSplitRectBeforeRenderContribution).toSelf().inSingletonScope();
            bind(RectRenderContribution).toService(VTableSplitRectBeforeRenderContribution);
          }

          if (isBound(SplitRectAfterRenderContribution)) {
            rebind(SplitRectAfterRenderContribution).to(VTableSplitRectAfterRenderContribution).inSingletonScope();
          } else {
            bind(VTableSplitRectAfterRenderContribution).toSelf().inSingletonScope();
            bind(RectRenderContribution).toService(VTableSplitRectAfterRenderContribution);
          }
        }
      };

      installRuntimeContributionModule(module, { app: app as any, targets: ['graphic-renderer'] });

      const rectRenderer = (app.registry.renderer.getAll() as any[]).find(renderer => renderer.type === 'rect');
      const contributionNames = rectRenderer._renderContribitions.map((item: unknown) => item.constructor.name);

      expect(contributionNames).toContain('VTableSplitRectAfterRenderContribution');
      expect(contributionNames).toContain('VTableSplitRectBeforeRenderContribution');
      expect(contributionNames).not.toContain('SplitRectAfterRenderContribution');
      expect(contributionNames).not.toContain('SplitRectBeforeRenderContribution');
    });
  });
});
