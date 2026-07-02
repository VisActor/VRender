import { application } from '../../../src/application';
import { AppContext, configureRuntimeApplicationForApp, getRuntimeInstallerBindingContext } from '../../../src/entries';
import { DefaultIncrementalDrawContribution } from '../../../src/render/contributions/render/incremental-draw-contribution';

describe('runtime installer', () => {
  test('runtime installer should use realm-level shared state for duplicated ESM entry evaluation', () => {
    const state = (globalThis as any)[Symbol.for('@visactor/vrender-core/runtime-installer-state')];

    expect(state).toBeDefined();
    expect(state.runtimeInstallerContext).toBe(getRuntimeInstallerBindingContext());
  });

  test('configureRuntimeApplicationForApp should configure an app-scoped incremental draw contribution factory', () => {
    const context = new AppContext();
    const app = {
      context,
      registry: context.registry,
      factory: context.factory,
      released: false,
      installPlugin: jest.fn(),
      installPlugins: jest.fn(),
      uninstallPlugin: jest.fn(),
      createStage: context.createStage.bind(context),
      release: context.release.bind(context)
    };

    configureRuntimeApplicationForApp(app as any);

    expect(application.incrementalDrawContributionFactory).toBeDefined();
    expect(() => application.incrementalDrawContributionFactory?.()).not.toThrow();
    expect(application.incrementalDrawContributionFactory?.()).toBeInstanceOf(DefaultIncrementalDrawContribution);
  });
});
