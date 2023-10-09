import { isNil, merge } from '@visactor/vutils';
import type { FederatedPointerEvent, ISymbolGraphicAttribute } from '@visactor/vrender-core';
import { CustomEvent } from '@visactor/vrender-core';
import { AbstractComponent } from '../../core/base';
import type { BaseGraphicAttributes } from '../../core/type';
import type { ControllerAttributes, LayoutType } from './type';
import { iconRight, iconPause, iconPlay, iconLeft, iconUp, iconDown } from './assets';
import { PlayerIcon } from './icon';
import { ControllerEventEnum, ControllerTypeEnum } from './constant';

export class Controller extends AbstractComponent<Required<ControllerAttributes>> {
  static defaultControllerAttr: ISymbolGraphicAttribute = {
    visible: true,
    x: 0,
    y: 0,
    size: 20,
    fill: '#91caff',
    pickMode: 'imprecise',
    cursor: 'pointer'
  };
  static defaultAttributes: ControllerAttributes = {
    [ControllerTypeEnum.Start]: {},
    [ControllerTypeEnum.Pause]: {},
    [ControllerTypeEnum.Backward]: {},
    [ControllerTypeEnum.Forward]: {}
  };

  private _isPaused = true;
  private _playController: PlayerIcon;
  private _forwardController: PlayerIcon;
  private _backwardController: PlayerIcon;

  private _layout: LayoutType;
  private _startAttr: BaseGraphicAttributes<ISymbolGraphicAttribute>;
  private _pauseAttr: BaseGraphicAttributes<ISymbolGraphicAttribute>;
  private _forwardAttr: BaseGraphicAttributes<ISymbolGraphicAttribute>;
  private _backwardAttr: BaseGraphicAttributes<ISymbolGraphicAttribute>;

  constructor(attributes: ControllerAttributes) {
    super(merge({}, Controller.defaultAttributes, attributes));
    this.updateAttributes();
    this._initPlay();
    this._initBackward();
    this._initForward();
    this._initEvents();
  }

  updateAttributes = () => {
    this._startAttr = {
      style: {
        symbolType: iconPlay,
        ...Controller.defaultControllerAttr,
        visible: this.attribute.start.visible,
        ...this.attribute.start.style
      }
    };
    this._pauseAttr = {
      style: {
        symbolType: iconPause,
        ...Controller.defaultControllerAttr,
        visible: this.attribute.pause.visible,
        ...this.attribute.pause.style
      }
    };
    this._forwardAttr = {
      style: {
        ...Controller.defaultControllerAttr,
        visible: this.attribute.forward.visible,
        ...this.attribute.forward.style
      }
    };
    this._backwardAttr = {
      style: {
        ...Controller.defaultControllerAttr,
        visible: this.attribute.backward.visible,
        ...this.attribute.backward.style
      }
    };
    this.updateLayout();
  };

  private updateLayout = () => {
    this._layout = this.attribute.layout;
    // 若水平布局
    if (this._layout === 'horizontal') {
      this._backwardAttr.style.symbolType = this._backwardAttr.style?.symbolType ?? iconLeft;
      this._forwardAttr.style.symbolType = this._forwardAttr.style?.symbolType ?? iconRight;
    }
    // 若垂直布局
    else if (this._layout === 'vertical') {
      this._backwardAttr.style.symbolType = this._backwardAttr.style?.symbolType ?? iconUp;
      this._forwardAttr.style.symbolType = this._forwardAttr.style?.symbolType ?? iconDown;
    }
  };

  private _initPlay = () => {
    if (isNil(this._playController)) {
      this._playController = new PlayerIcon({
        ...this._startAttr.style
      });

      this.add(this._playController);
    }
  };

  private _initBackward = () => {
    if (isNil(this._backwardController)) {
      this._backwardController = new PlayerIcon({
        ...this._backwardAttr.style
      });

      this.add(this._backwardController);
    }
  };

  private _initForward = () => {
    if (isNil(this._forwardController)) {
      this._forwardController = new PlayerIcon({
        ...this._forwardAttr.style
      });

      this.add(this._forwardController);
    }
  };

  /**
   * 初始化事件
   * 1. 注册
   */
  private _initEvents = () => {
    if (this.attribute.disableActiveEffect) {
      return;
    }
    this._playController.addEventListener('pointerdown', (e: FederatedPointerEvent) => {
      e.stopPropagation();

      if (this._isPaused === true) {
        this.play();
      } else {
        this.pause();
      }
    });

    this._backwardController.addEventListener('pointerdown', (e: FederatedPointerEvent) => {
      e.stopPropagation();
      this.backward();
    });

    this._forwardController.addEventListener('pointerdown', (e: FederatedPointerEvent) => {
      e.stopPropagation();
      this.forward();
    });
  };

  private _createCustomEvent = (eventType: ControllerEventEnum) => {
    const customEvent = new CustomEvent(eventType, { eventType });
    // FIXME: 需要在 vrender 的事件系统支持
    // @ts-ignore
    customEvent.manager = this.stage?.eventSystem.manager;
    return customEvent;
  };

  render(): void {
    this.updateAttributes();
    this.renderPlay();
    this.renderBackward();
    this.renderForward();
  }

  renderPlay = () => {
    if (this._isPaused) {
      this._playController.setAttributes({
        symbolType: this._playController.getComputedAttribute('symbolType'),
        ...this._startAttr.style
      });
    } else {
      this._playController.setAttributes({
        symbolType: this._playController.getComputedAttribute('symbolType'),
        ...this._pauseAttr.style
      });
    }
  };

  renderBackward = () => {
    this._backwardController.setAttributes(this._backwardAttr.style);
  };

  renderForward = () => {
    this._forwardController.setAttributes(this._forwardAttr.style);
  };

  play = () => {
    const onPlayEvent = this._createCustomEvent(ControllerEventEnum.OnPlay);
    this.dispatchEvent(onPlayEvent);
  };

  pause = () => {
    const onPauseEvent = this._createCustomEvent(ControllerEventEnum.OnPause);
    this.dispatchEvent(onPauseEvent);
  };

  forward = () => {
    const onPlayEvent = this._createCustomEvent(ControllerEventEnum.OnForward);
    this.dispatchEvent(onPlayEvent);
  };

  backward = () => {
    const onPlayEvent = this._createCustomEvent(ControllerEventEnum.OnBackward);
    this.dispatchEvent(onPlayEvent);
  };

  togglePlay = () => {
    this._playController.setAttributes(this._startAttr.style);
    this._isPaused = true;
  };

  togglePause = () => {
    this._playController.setAttributes(this._pauseAttr.style);
    this._isPaused = false;
  };
}
