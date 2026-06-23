import { application } from '../../../src/application';
import { AppContext, configureRuntimeApplicationForApp } from '../../../src/entries';
import { DefaultIncrementalDrawContribution } from '../../../src/render/contributions/render/incremental-draw-contribution';

describe('runtime installer', () => {
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
