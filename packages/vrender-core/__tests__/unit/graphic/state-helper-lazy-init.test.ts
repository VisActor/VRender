import { createRect } from '../../../src/graphic/rect';

describe('Graphic state helper lazy init', () => {
  const createGraphic = () => {
    const graphic = createRect({
      x: 0,
      y: 0,
      width: 10,
      height: 20,
      fill: 'blue'
    });

    jest.spyOn(graphic as any, 'getGraphicService').mockReturnValue({
      onAttributeUpdate: jest.fn(),
      onSetStage: jest.fn()
    });

    return graphic;
  };

  test('should not allocate state helpers on plain construction or basic attribute updates', () => {
    const graphic = createGraphic();

    expect((graphic as any).stateStyleResolver).toBeUndefined();
    expect((graphic as any).deepStateStyleResolver).toBeUndefined();
    expect((graphic as any).stateTransitionOrchestrator).toBeUndefined();

    graphic.setAttribute('fill', 'green');

    expect((graphic as any).stateStyleResolver).toBeUndefined();
    expect((graphic as any).deepStateStyleResolver).toBeUndefined();
    expect((graphic as any).stateTransitionOrchestrator).toBeUndefined();
  });

  test('should create the shallow resolver only when useStates first needs it', () => {
    const graphic = createGraphic();
    graphic.stateProxy = jest.fn(() => ({
      fill: 'red'
    }));

    expect((graphic as any).stateStyleResolver).toBeUndefined();

    graphic.useStates(['hover'], false);

    expect((graphic as any).stateStyleResolver).toBeDefined();
    expect((graphic as any).deepStateStyleResolver).toBeUndefined();
    expect((graphic as any).stateTransitionOrchestrator).toBeUndefined();
  });

  test('should create the deep resolver only when deep merge mode is exercised', () => {
    const graphic = createGraphic();
    (graphic as any).stateMergeMode = 'deep';
    graphic.stateProxy = jest.fn(() => ({
      fill: 'red'
    }));

    expect((graphic as any).deepStateStyleResolver).toBeUndefined();

    graphic.useStates(['hover'], false);

    expect((graphic as any).stateStyleResolver).toBeUndefined();
    expect((graphic as any).deepStateStyleResolver).toBeDefined();
  });

  test('should create the transition orchestrator only when animated state transitions run', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;
    (graphic as any).applyAnimationState = jest.fn();

    expect((graphic as any).stateTransitionOrchestrator).toBeUndefined();

    graphic.useStates(['hover'], true);

    expect((graphic as any).stateTransitionOrchestrator).toBeDefined();
  });
});
