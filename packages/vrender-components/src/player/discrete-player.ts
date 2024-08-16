import { isNil, merge } from '@visactor/vutils';
import type { FederatedPointerEvent } from '@visactor/vrender-core';
import { vglobal } from '@visactor/vrender-core';
import { BasePlayer } from './base-player';
import type { DirectionType, DiscretePlayerAttributes, PlayerAttributes } from './type';
import { DirectionEnum, PlayerEventEnum } from './type';
import { forwardStep, isReachEnd, isReachStart } from './utils';
import { ControllerEventEnum } from './controller/constant';
import type { ComponentOptions } from '../interface';
import { loadDiscretePlayerComponent } from './register';

loadDiscretePlayerComponent();
export class DiscretePlayer extends BasePlayer<DiscretePlayerAttributes> {
  declare attribute: DiscretePlayerAttributes;

  private _activeIndex = -1;

  protected _alternate: boolean;
  protected _interval: number;

  private _isPlaying: boolean;
  private _direction: DirectionType;
  private _tickTime: number;
  private _rafId: number;
  private _isReachEnd = false;

  constructor(attributes: DiscretePlayerAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, attributes));

    this._initAttributes();
    this._initDataIndex();
    this._initEvents();
  }

  setAttributes(params: Partial<Required<PlayerAttributes>>, forceUpdateTag?: boolean): void {
    super.setAttributes(params, forceUpdateTag);
    this._initAttributes();
  }

  /**
   * 初始化属性
   */
  _initAttributes = () => {
    super._initAttributes();
    this._alternate = this.attribute.alternate ?? false;
    this._interval = this.attribute.interval ?? 1000;
    this._direction = this.attribute.direction ?? DirectionEnum.Default;
  };

  /**
   * 初始化dataIndex
   */
  _initDataIndex = () => {
    this._dataIndex = isNil(this.attribute.dataIndex)
      ? this._direction === 'default'
        ? this._minIndex
        : this._maxIndex
      : this.attribute.dataIndex ?? 0;

    this._slider.setAttribute('value', this._dataIndex);
  };

  /**
   * 初始化事件
   */
  private _initEvents = () => {
    if (this.attribute.disableTriggerEvent) {
      return;
    }
    this._controller.addEventListener(ControllerEventEnum.OnPlay, (e: FederatedPointerEvent) => {
      e.stopPropagation();
      this.play();
    });
    this._controller.addEventListener(ControllerEventEnum.OnPause, (e: FederatedPointerEvent) => {
      e.stopPropagation();
      this.pause();
    });
    this._controller.addEventListener(ControllerEventEnum.OnForward, (e: FederatedPointerEvent) => {
      e.stopPropagation();
      this.forward();
    });
    this._controller.addEventListener(ControllerEventEnum.OnBackward, (e: FederatedPointerEvent) => {
      e.stopPropagation();
      this.backward();
    });

    this._slider.addEventListener('change', (e: FederatedPointerEvent & { detail: { value: number } }) => {
      const middle = Math.floor(e.detail.value) + 0.5;
      this._dataIndex = e.detail.value >= middle ? Math.ceil(e.detail.value) : Math.floor(e.detail.value);
      this._slider.setValue(this._dataIndex);
      this.dispatchCustomEvent(PlayerEventEnum.change);
    });
  };

  /**
   * 派遣事件
   */
  dispatchCustomEvent(event: PlayerEventEnum) {
    super.dispatchCustomEvent(event, this._dataIndex);
  }

  /**
   * 播放接口
   */
  play = () => {
    if (this._isPlaying) {
      return;
    }
    // 一条数据无需播放
    if (this._data.length === 1) {
      return;
    }
    // 图标切换
    this._controller.togglePause();
    // 播放状态更新
    this._isPlaying = true;
    // 若到达末尾, 则计算下一次播放的状态下标
    if (
      isReachEnd({
        dataIndex: this._dataIndex,
        maxIndex: this._maxIndex,
        minIndex: this._minIndex,
        direction: this._direction
      }) ||
      isReachStart({
        dataIndex: this._dataIndex,
        maxIndex: this._maxIndex,
        minIndex: this._minIndex,
        direction: this._direction
      })
    ) {
      // 根据方向恢复dataIndex
      if (this._direction === DirectionEnum.Default) {
        this._updateDataIndex(this._minIndex);
      } else {
        this._updateDataIndex(this._maxIndex);
      }
    }

    // 事件触发
    this.dispatchCustomEvent(PlayerEventEnum.play);
    // 重置结束状态
    this._isReachEnd = false;
    // 重置tick时间, 暂停后重新播放也会重新计时
    this._tickTime = Date.now();
    // 开启动画
    this._rafId = vglobal.getRequestAnimationFrame()(this._play.bind(this, true));
  };

  /**
   * 播放过程
   */
  private _play = (isFirstPlay: boolean) => {
    const now = Date.now();

    // 抵达终点, 延迟一个interval触发end
    if (this._isReachEnd && now - this._tickTime >= this._interval) {
      this._isReachEnd = false;
      this._playEnd();
      return;
    }
    // 未达终点

    // 第一个播放帧, 立即执行
    if (isFirstPlay && this._activeIndex !== this._dataIndex) {
      this.dispatchCustomEvent(PlayerEventEnum.change);
      this._activeIndex = this._dataIndex;
    }
    // 中间播放帧, 每一个interval执行一次
    else if (now - this._tickTime >= this._interval) {
      this._tickTime = now;
      this._updateDataIndex(forwardStep(this._direction, this._dataIndex, this._minIndex, this._maxIndex));
      this._activeIndex = this._dataIndex;
      this.dispatchCustomEvent(PlayerEventEnum.change);
    }

    // 终止条件
    if (
      (this._direction === 'default' && this._dataIndex >= this._maxIndex) ||
      (this._direction === 'reverse' && this._dataIndex <= this._minIndex)
    ) {
      this._isReachEnd = true;
    }

    this._rafId = vglobal.getRequestAnimationFrame()(this._play.bind(this, false));
  };

  /**
   * 更新数据
   */
  private _updateDataIndex = (dataIndex: number) => {
    this._dataIndex = dataIndex;
    this._slider.setValue(this._dataIndex);
  };

  /**
   * 播放结束
   */
  private _playEnd = () => {
    // 播放状态更新
    this._isPlaying = false;
    // 图标切换
    this._controller.togglePlay();
    // 取消播放动画
    vglobal.getCancelAnimationFrame()(this._rafId);
    // 重置ActiveIndex
    this._activeIndex = -1;
    // 播放结束时并且到达终点
    this.dispatchCustomEvent(PlayerEventEnum.end);
  };

  /**
   * 暂停接口
   */
  pause = () => {
    if (!this._isPlaying) {
      return;
    }
    this._isPlaying = false;
    vglobal.getCancelAnimationFrame()(this._rafId);
    this._controller.togglePlay();

    this.dispatchCustomEvent(PlayerEventEnum.pause);
  };

  /**
   * 后退接口
   */
  backward = () => {
    const { loop = false } = this.attribute as PlayerAttributes;
    let index;
    if (loop) {
      index = this._dataIndex - 1 < this._minIndex ? this._maxIndex : this._dataIndex - 1;
    } else {
      index = Math.max(this._dataIndex - 1, this._minIndex);
    }
    this._updateDataIndex(index);

    this.dispatchCustomEvent(PlayerEventEnum.change);
    this.dispatchCustomEvent(PlayerEventEnum.backward);
  };

  /**
   * 前进接口
   */
  forward = () => {
    const { loop = false } = this.attribute as PlayerAttributes;
    let index;
    if (loop) {
      index = this._dataIndex + 1 > this._maxIndex ? this._minIndex : this._dataIndex + 1;
    } else {
      index = Math.min(this._dataIndex + 1, this._maxIndex);
    }
    this._updateDataIndex(index);

    this.dispatchCustomEvent(PlayerEventEnum.change);
    this.dispatchCustomEvent(PlayerEventEnum.forward);
  };
}
