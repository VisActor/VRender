import type { IGraphic, Stage } from '@visactor/vrender-core';
import { createCanvas } from '../../util/dom';
import { createStage } from '../../util/vrender';
import { initBrowserEnv } from '@visactor/vrender-kits';
import { Controller } from '../../../src/player/controller';
import { ControllerEventEnum, ControllerTypeEnum } from '../../../src/player/controller/constant';
initBrowserEnv();

describe('PlayerController', () => {
  let stage: Stage;
  beforeAll(() => {
    createCanvas(document.body, 'main');
    stage = createStage('main');
  });

  afterAll(() => {
    stage.release();
  });

  it('basic play/pause/forward/backward event ', async () => {
    const controller = new Controller({
      [ControllerTypeEnum.Start]: {},
      [ControllerTypeEnum.Pause]: {},
      [ControllerTypeEnum.Backward]: {},
      [ControllerTypeEnum.Forward]: {}
    });

    stage.defaultLayer.add(controller as unknown as IGraphic);
    stage.render();

    // @ts-ignore
    const playPromise = new Promise((resolve, reject) => {
      // @ts-ignore
      controller.addEventListener(ControllerEventEnum.OnPlay, () => {
        resolve(true);
      });
      // @ts-ignore
      controller.play();
    });

    const pausePromise = new Promise((resolve, reject) => {
      // @ts-ignore
      controller.addEventListener(ControllerEventEnum.OnPause, () => {
        resolve(true);
      });
      // @ts-ignore
      controller.pause();
    });

    const forwardPromise = new Promise((resolve, reject) => {
      // @ts-ignore
      controller.addEventListener(ControllerEventEnum.OnForward, () => {
        resolve(true);
      });
      // @ts-ignore
      controller.forward();
    });

    const backwardPromise = new Promise((resolve, reject) => {
      // @ts-ignore
      controller.addEventListener(ControllerEventEnum.OnBackward, () => {
        resolve(true);
      });
      // @ts-ignore
      controller.backward();
    });

    const res = await Promise.all([playPromise, pausePromise, forwardPromise, backwardPromise]);
    expect(res).toEqual([true, true, true, true]);

    // @ts-ignore
    controller._dispatchEvent(ControllerEventEnum.OnPlay);
  });
});
