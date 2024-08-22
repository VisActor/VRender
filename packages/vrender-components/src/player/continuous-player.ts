import type { FederatedPointerEvent } from '@visactor/vrender-core';
import { vglobal } from '@visactor/vrender-core';
import { BasePlayer } from './base-player';
import type { ContinuousPlayerAttributes } from './type';
import { PlayerEventEnum } from './type';
import { ControllerEventEnum } from './controller/constant';
import { loadContinuousPlayerComponent } from './register';

loadContinuousPlayerComponent();
export class ContinuousPlayer extends BasePlayer<ContinuousPlayerAttributes> {
  declare attribute: ContinuousPlayerAttributes;

  private _activeIndex: number;

  protected _alternate: boolean;
  protected _interval: number;
  protected _totalDuration: number;

  private _isPlaying = false;
  private _startTime: number = Date.now();
  private _elapsed: number;
  private _rafId: number;

  constructor(attributes: ContinuousPlayerAttributes) {
    super(attributes);

    this._initAttributes();
    this._initDataIndex();
    this._initEvents();
  }

  /**
   * 初始化属性
   */
  _initAttributes = () => {
    super._initAttributes();
    // 新增一个占位数据
    this._maxIndex = this._data.length;
    this._slider.setAttribute('max', this._maxIndex);

    this._isPlaying = false;
    this._elapsed = 0;
    this._interval = this.attribute.interval ?? 1000;

    // 播放帧数(10条数据, 需要10个播放帧)
    const frames = this._data.length;

    // 若用户配置了总时长
    if (this.attribute.totalDuration && this._data.length) {
      this._totalDuration = this.attribute.totalDuration;
      // 避免除0
      this._interval = this._totalDuration / (frames ?? 1);
    }
    // 若未配置总时长, 则根据interval算出一个总时长, interval有默认值
    else {
      this._totalDuration = this._interval * frames;
      this._interval = this.attribute.interval;
    }
  };

  /**
   * 初始化dataIndex
   */
  _initDataIndex = () => {
    this._dataIndex = this.attribute.dataIndex ?? this._minIndex;
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

    this._slider.addEventListener('change', (e: FederatedPointerEvent) => {
      e.stopPropagation();
      /**
       * 根据value, 反推开始时间
       * 1. 计算进度
       * 2. 计算流逝时间
       * 3. 用现在的时间, 模拟一个开始时间
       */
      const value = (e.detail as unknown as { value: number; position: number })?.value;
      const progress = value / this._maxIndex;
      this._elapsed = progress * this._totalDuration;
      this._startTime = Date.now() - this._elapsed;

      this._dispatchChange(value);
    });
  };

  /**
   * 根据已流逝时间和总时长, 计算slider的值
   */
  private _getSliderValue = () => {
    const progress = this._elapsed / this._totalDuration;
    return Math.min(progress * this._maxIndex, this._maxIndex);
  };

  /**
   * 根据流逝时间, 更新Slider的值
   */
  private _updateSlider = () => {
    const value = this._getSliderValue();
    this._dataIndex = Math.floor(value);
    this._slider.setValue(Math.min(value, this._maxIndex));
    this._dispatchChange(Math.floor(value));
  };

  /**
   * 根据Slider的值, 判断是否要触发Change事件.
   */
  private _dispatchChange = (value: number) => {
    const index = Math.floor(value);
    if (index !== this._activeIndex) {
      this._dataIndex = index;
      this._activeIndex = index;

      if (index !== this._maxIndex) {
        this.dispatchCustomEvent(PlayerEventEnum.change);
      }
    }
  };

  /**
   * 派遣事件
   * @param eventType 事件类型
   */
  dispatchCustomEvent(eventType: PlayerEventEnum) {
    super.dispatchCustomEvent(eventType, this._dataIndex);
  }

  /**
   * 播放接口
   */
  play = async () => {
    if (this._isPlaying) {
      return;
    }
    // 切换按钮
    this._controller.togglePause();
    // 播放状态更新
    this._isPlaying = true;
    // 播放结束后再点击play, 此条件下生效.
    if (this._elapsed >= this._totalDuration) {
      this._elapsed = 0;
    }
    // 此时此刻减去已流逝的时间, 则为起点对应的时间戳.
    this._startTime = Date.now() - this._elapsed;
    // 事件
    this.dispatchCustomEvent(PlayerEventEnum.play);
    // 开始播放动画
    this._rafId = vglobal.getRequestAnimationFrame()(this._play.bind(this));
  };

  /**
   * 播放动画主要逻辑
   */
  private _play = () => {
    // 计算已流逝的时间, 但不需要保存
    this._elapsed = Date.now() - this._startTime;
    // 计算Slider的值.
    const value = this._getSliderValue();
    // 更新Slider的值.
    this._updateSlider();

    // 播放终止条件
    if (value >= this._maxIndex) {
      this._playEnd();
      return;
    }

    // 持续播放
    this._rafId = vglobal.getRequestAnimationFrame()(this._play.bind(this));
  };

  /**
   * 播放结束时触发
   */
  private _playEnd = () => {
    // 播放状态更新
    this._isPlaying = false;
    // 取消播放动画
    vglobal.getCancelAnimationFrame()(this._rafId);
    // 切换按钮
    this._controller.togglePlay();
    // 事件
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
    // 计算已流逝的时间, 需要记录下来
    this._elapsed = Date.now() - this._startTime;
    vglobal.getCancelAnimationFrame()(this._rafId);
    this._controller.togglePlay();

    this.dispatchCustomEvent(PlayerEventEnum.pause);
  };

  /**
   * 前进接口
   */
  backward = () => {
    // 按下按钮的时间
    const now = Date.now();
    // 步长
    const interval = this._interval * 1;
    // 流逝时间 减去 interval
    const elapsed = this._elapsed - interval;

    // 若到达起点
    if (elapsed <= 0) {
      this._elapsed = 0;
      this._startTime = now;
    }
    // 若未到达起点
    else {
      this._elapsed = elapsed;
      this._startTime = this._startTime + this._interval;
    }
    // 更新slider
    this._updateSlider();

    this.dispatchCustomEvent(PlayerEventEnum.backward);
  };

  /**
   * 后退接口
   */
  forward = () => {
    // 按下按钮的时间
    const now = Date.now();
    // 步长
    const interval = this._interval * 1;
    // 流逝时间 加上 1个interval
    const elapsed = this._elapsed + interval;
    // 若超过终点
    if (elapsed >= this._totalDuration) {
      this._startTime = now - this._totalDuration;
      this._elapsed = this._totalDuration;
    }
    // 未超过终点
    else {
      this._startTime = this._startTime - interval;
      this._elapsed = elapsed;
    }
    // 更新slider
    this._updateSlider();

    this.dispatchCustomEvent(PlayerEventEnum.forward);
  };

  render() {
    super.render();
  }
}
