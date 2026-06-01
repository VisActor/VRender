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

    expect((graphic as any).stateEngine).toBeUndefined();
    expect((graphic as any).stateTransitionOrchestrator).toBeUndefined();

    graphic.setAttribute('fill', 'green');

    expect((graphic as any).stateEngine).toBeUndefined();
    expect((graphic as any).stateTransitionOrchestrator).toBeUndefined();
  });

  test('should create the state engine only when state resolution first needs it', () => {
    const graphic = createGraphic();
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;

    expect((graphic as any).stateEngine).toBeUndefined();

    graphic.useStates(['hover'], false);

    expect((graphic as any).stateEngine).toBeDefined();
    expect((graphic as any).stateTransitionOrchestrator).toBeUndefined();
  });

  test('should use the state engine for deep merge resolution', () => {
    const graphic = createGraphic();
    (graphic as any).stateMergeMode = 'deep';
    graphic.states = {
      hover: {
        fill: 'red'
      }
    } as any;

    expect((graphic as any).stateEngine).toBeUndefined();

    graphic.useStates(['hover'], false);

    expect((graphic as any).stateEngine).toBeDefined();
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
