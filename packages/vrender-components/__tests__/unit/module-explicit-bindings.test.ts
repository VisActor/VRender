declare const require: any;

const createContainerMock = () => ({
  isBound: jest.fn(() => false),
  bind: jest.fn(() => ({
    toSelf: jest.fn().mockReturnValue({
      inSingletonScope: jest.fn()
    }),
    toService: jest.fn()
  })),
  load: jest.fn()
});

const mockLegacyContainer = createContainerMock();
const mockRuntimeContainer = createContainerMock();
const mockRefreshRuntimeInstallerContributions = jest.fn();
const mockConfigureRuntimeApplicationForApp = jest.fn();
const mockInstallRuntimeGraphicRenderersToApp = jest.fn();

jest.mock('@visactor/vrender-core', () => ({
  AutoEnablePlugins: Symbol.for('AutoEnablePlugins'),
  InteractiveSubRenderContribution: Symbol.for('InteractiveSubRenderContribution'),
  ContainerModule: jest.fn(),
  configureRuntimeApplicationForApp: mockConfigureRuntimeApplicationForApp,
  getLegacyBindingContext: jest.fn(() => mockLegacyContainer),
  getRuntimeInstallerBindingContext: jest.fn(() => mockRuntimeContainer),
  installRuntimeGraphicRenderersToApp: mockInstallRuntimeGraphicRenderersToApp,
  refreshRuntimeInstallerContributions: mockRefreshRuntimeInstallerContributions
}));

jest.mock('../../src/scrollbar/scrollbar-plugin', () => ({
  ScrollBarPlugin: class ScrollBarPlugin {}
}));

jest.mock('../../src/poptip/contribution', () => ({
  PopTipRenderContribution: class PopTipRenderContribution {}
}));

jest.mock('../../src/poptip/poptip-plugin', () => ({
  PopTipPlugin: class PopTipPlugin {},
  PopTipForClipedTextPlugin: class PopTipForClipedTextPlugin {}
}));

describe('component explicit bindings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLegacyContainer.isBound.mockReturnValue(false);
    mockRuntimeContainer.isBound.mockReturnValue(false);
  });

  test('loadScrollbar should bind plugin directly without container.load', () => {
    const { loadScrollbar } = require('../../src/scrollbar/module');

    loadScrollbar();

    expect(mockLegacyContainer.bind).toHaveBeenCalled();
    expect(mockLegacyContainer.isBound).toHaveBeenCalled();
    expect(mockRuntimeContainer.bind).not.toHaveBeenCalled();
  });

  test('loadPoptip should bind contribution and plugins to legacy and runtime contexts', () => {
    const vrenderCore = require('@visactor/vrender-core');
    const { loadPoptip } = require('../../src/poptip/module');

    loadPoptip();

    expect(vrenderCore.getLegacyBindingContext).toHaveBeenCalledTimes(1);
    expect(vrenderCore.getRuntimeInstallerBindingContext).toHaveBeenCalledTimes(1);
    expect(mockLegacyContainer.bind).toHaveBeenCalled();
    expect(mockRuntimeContainer.bind).toHaveBeenCalled();
    expect(mockRefreshRuntimeInstallerContributions).toHaveBeenCalledTimes(1);
  });

  test('installPoptipToApp should require an app instance', () => {
    const { installPoptipToApp } = require('../../src/poptip/module');

    expect(() => installPoptipToApp()).toThrow('installPoptipToApp requires an app instance');
  });
});
