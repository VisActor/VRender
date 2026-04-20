import type { IGraphic, Stage } from '@visactor/vrender-core';
import { createCanvas } from '../../util/dom';
import { createTestStage } from '../../util/vrender';
import { Controller } from '../../../src/player/controller';
import { iconDown, iconPause, iconPlay, iconUp } from '../../../src/player/controller/assets';
import { PlayerIcon } from '../../../src/player/controller/icon';
import { ControllerTypeEnum } from '../../../src/player/controller/constant';

describe('PlayerController additional branches', () => {
  let stage: Stage;
  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createTestStage('main');
  });

  afterAll(() => {
    stage.release();
  });

  test('disableTriggerEvent skips icon pointerdown bindings', () => {
    const addListenerSpy = jest.spyOn(PlayerIcon.prototype as any, 'addEventListener');

    const controller = new Controller({
      disableTriggerEvent: true,
      layout: 'horizontal',
      [ControllerTypeEnum.Start]: {},
      [ControllerTypeEnum.Pause]: {},
      [ControllerTypeEnum.Backward]: {},
      [ControllerTypeEnum.Forward]: {}
    } as any);

    stage.defaultLayer.add(controller as unknown as IGraphic);
    stage.render();

    expect(addListenerSpy).not.toHaveBeenCalled();
    addListenerSpy.mockRestore();
  });

  test('custom symbolType is not overwritten by layout default', () => {
    const controller = new Controller({
      layout: 'horizontal',
      [ControllerTypeEnum.Start]: {},
      [ControllerTypeEnum.Pause]: {},
      [ControllerTypeEnum.Backward]: { style: { symbolType: iconUp } },
      [ControllerTypeEnum.Forward]: { style: { symbolType: iconDown } }
    } as any);

    stage.defaultLayer.add(controller as unknown as IGraphic);
    stage.render();

    // @ts-ignore
    expect(controller._backwardController.attribute.symbolType).toBe(iconUp);
    // @ts-ignore
    expect(controller._forwardController.attribute.symbolType).toBe(iconDown);
  });

  test('renderPlay uses start/pause attr based on paused state', () => {
    const controller = new Controller({
      layout: 'horizontal',
      [ControllerTypeEnum.Start]: {},
      [ControllerTypeEnum.Pause]: {},
      [ControllerTypeEnum.Backward]: {},
      [ControllerTypeEnum.Forward]: {}
    } as any);

    stage.defaultLayer.add(controller as unknown as IGraphic);
    stage.render();

    // @ts-ignore
    const playController = controller._playController;
    const getComputedSpy = jest.spyOn(playController, 'getComputedAttribute');
    const setAttributesSpy = jest.spyOn(playController, 'setAttributes');

    setAttributesSpy.mockClear();
    getComputedSpy.mockClear();

    // @ts-ignore
    controller.renderPlay();
    expect(getComputedSpy).toHaveBeenCalledWith('symbolType');
    expect(setAttributesSpy).toHaveBeenLastCalledWith(expect.objectContaining({ symbolType: iconPlay }));

    // @ts-ignore
    controller.togglePause();
    setAttributesSpy.mockClear();
    getComputedSpy.mockClear();

    // @ts-ignore
    controller.renderPlay();
    expect(getComputedSpy).toHaveBeenCalledWith('symbolType');
    expect(setAttributesSpy).toHaveBeenLastCalledWith(expect.objectContaining({ symbolType: iconPause }));
  });
});
