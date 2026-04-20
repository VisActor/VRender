import type { IGraphic, Stage } from '@visactor/vrender-core';
import { createCanvas } from '../../util/dom';
import { createTestStage } from '../../util/vrender';
import { Controller } from '../../../src/player/controller';
import { PlayerIcon } from '../../../src/player/controller/icon';
import { iconDown, iconLeft, iconPause, iconPlay, iconRight, iconUp } from '../../../src/player/controller/assets';
import { ControllerTypeEnum } from '../../../src/player/controller/constant';

describe('PlayerController layout and toggle', () => {
  let stage: Stage;
  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createTestStage('main');
  });

  afterAll(() => {
    stage.release();
  });

  test('horizontal layout defaults iconLeft/iconRight', () => {
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
    expect(controller._playController).toBeInstanceOf(PlayerIcon);
    // @ts-ignore
    expect(controller._playController.attribute.symbolType).toBe(iconPlay);
    // @ts-ignore
    expect(controller._backwardController.attribute.symbolType).toBe(iconLeft);
    // @ts-ignore
    expect(controller._forwardController.attribute.symbolType).toBe(iconRight);
  });

  test('vertical layout defaults iconUp/iconDown', () => {
    const controller = new Controller({
      layout: 'vertical',
      [ControllerTypeEnum.Start]: {},
      [ControllerTypeEnum.Pause]: {},
      [ControllerTypeEnum.Backward]: {},
      [ControllerTypeEnum.Forward]: {}
    } as any);

    stage.defaultLayer.add(controller as unknown as IGraphic);
    stage.render();

    // @ts-ignore
    expect(controller._backwardController.attribute.symbolType).toBe(iconUp);
    // @ts-ignore
    expect(controller._forwardController.attribute.symbolType).toBe(iconDown);
  });

  test('togglePause/togglePlay updates play icon', () => {
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
    expect(controller._playController.attribute.symbolType).toBe(iconPlay);

    // @ts-ignore
    controller.togglePause();
    // @ts-ignore
    expect(controller._playController.attribute.symbolType).toBe(iconPause);

    // @ts-ignore
    controller.togglePlay();
    // @ts-ignore
    expect(controller._playController.attribute.symbolType).toBe(iconPlay);
  });
});
