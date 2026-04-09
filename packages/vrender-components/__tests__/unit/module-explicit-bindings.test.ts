declare const require: any;

const bindMock = jest.fn(() => ({
  toSelf: jest.fn().mockReturnValue({
    inSingletonScope: jest.fn()
  }),
  toService: jest.fn()
}));

const containerMock = {
  isBound: jest.fn(() => false),
  bind: bindMock,
  load: jest.fn()
};

jest.mock('@visactor/vrender-core', () => ({
  AutoEnablePlugins: Symbol.for('AutoEnablePlugins'),
  InteractiveSubRenderContribution: Symbol.for('InteractiveSubRenderContribution'),
  ContainerModule: jest.fn(),
  getLegacyBindingContext: jest.fn(() => containerMock)
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
    containerMock.isBound.mockReturnValue(false);
  });

  test('loadScrollbar should bind plugin directly without container.load', () => {
    const { loadScrollbar } = require('../../src/scrollbar/module');

    loadScrollbar();

    expect(containerMock.bind).toHaveBeenCalled();
    expect(containerMock.isBound).toHaveBeenCalled();
  });

  test('loadPoptip should bind contribution and plugins directly without container.load', () => {
    const { loadPoptip } = require('../../src/poptip/module');

    loadPoptip();

    expect(containerMock.bind).toHaveBeenCalled();
    expect(containerMock.isBound).toHaveBeenCalled();
  });
});
