import type { INode } from '@visactor/vrender-core';
import { isNumber, isValidNumber, max, merge } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { ComponentOptions, OrientType } from '../interface';
import type { SliderAttributes } from '../slider';
import { Slider } from '../slider';
import type { ControllerAttributes } from './controller';
import { Controller } from './controller';
import type {
  Datum,
  PlayerEventEnum,
  PlayerAttributes,
  RailStyleType,
  ControllerType,
  TrackStyleType,
  HandlerStyleType
} from './type';
import { RailDefaultSize, defaultControllerAttributes } from './constant';
import { isHorizontal } from './utils';

/**
 * 基本播放器组件
 * 提供最基本的布局能力,
 */
export abstract class BasePlayer<T> extends AbstractComponent<Required<PlayerAttributes>> {
  static defaultAttributes = {
    visible: true,
    data: [] as Datum[],
    interval: 1000,
    orient: 'bottom',
    align: 'center',
    size: {
      height: 20,
      width: 300
    },
    slider: {
      visible: true,
      space: 10,
      dx: 0,
      dy: 0,
      railStyle: {
        cornerRadius: 5
      },
      trackStyle: {},
      handlerStyle: {}
    },
    controller: {
      visible: true,
      start: { ...defaultControllerAttributes, key: 'start', position: 'start', space: 0 },
      pause: { ...defaultControllerAttributes, key: 'pause', position: 'start' },
      forward: { ...defaultControllerAttributes, key: 'forward', position: 'end' },
      backward: { ...defaultControllerAttributes, key: 'backward', position: 'start' }
    }
  };

  // 组件属性
  protected _slider: Slider;
  protected _controller: Controller;

  // 数据属性
  protected _data = [] as Datum[];
  protected _minIndex: number;
  getMinIndex() {
    return this._minIndex;
  }
  protected _maxIndex: number;
  getMaxIndex() {
    return this._maxIndex;
  }

  // 滑轨属性
  private _sliderVisible: boolean;
  private _railStyle: RailStyleType;
  private _trackStyle: TrackStyleType;
  private _handlerStyle: HandlerStyleType;

  // 控件属性
  private _controllerVisible: boolean;
  private _start: ControllerType;
  private _pause: ControllerType;
  private _forward: ControllerType;
  private _backward: ControllerType;

  // 布局属性
  private _size: { width: number; height: number };
  private _orient: OrientType;

  // dataIndex, 代表slider的value
  protected _dataIndex: number = 0;
  getDataIndex() {
    return this._dataIndex;
  }

  private _layoutInfo: {
    // 滚动条位置
    slider?: { x: number; y: number; size: number };

    // 控件位置
    start?: { x: number; y: number; size: number };
    pause?: { x: number; y: number; size: number };
    backward?: { x: number; y: number; size: number };
    forward?: { x: number; y: number; size: number };
  } = {};

  abstract play(): void;
  abstract pause(): void;
  abstract backward(): void;
  abstract forward(): void;

  constructor(attributes: T, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, BasePlayer.defaultAttributes, attributes));
    // 先初始化属性, 再初始化Slider、Controller, 最后初始化事件.
    this._initAttributes();
    this._initDataIndex();
    this._initLayoutInfo();
    this._initController();
    this._initSlider();
  }

  /**
   * 初始化属性
   */
  _initAttributes() {
    // 基本布局属性
    this._size = this.attribute.size;
    this._orient = this.attribute.orient;

    // Slider范围, 起点一定要从0开始
    this._data = this.attribute.data;
    this._minIndex = 0;
    this._maxIndex = this._data.length - 1;

    const { slider = {}, controller = {} as PlayerAttributes['controller'] } = this.attribute;
    // 轨道样式
    this._sliderVisible = slider.visible;
    this._railStyle = { ...slider.railStyle };
    this._trackStyle = { ...slider.trackStyle };
    this._handlerStyle = { ...slider.handlerStyle };

    // 控制器样式
    this._controllerVisible = controller.visible;
    this._start = { ...controller.start };
    this._pause = { ...controller.pause };
    this._forward = { ...controller.forward };
    this._backward = { ...controller.backward };
  }

  /**
   * 初始化dataIndex
   */
  _initDataIndex() {
    this._dataIndex = this.attribute.dataIndex ?? 0;
  }

  private _initLayoutInfo() {
    // 控制器
    const controllers = [this._start, this._backward, this._forward].sort((a, b) => a.order - b.order);
    // 在开始位置的控制器
    const startControllers = controllers.filter(d => d.position !== 'end');
    // 在结束位置的控制器
    const endControllers = controllers.filter(d => d.position === 'end');
    // 滑轨横切面长度
    const railSectionLength =
      (isHorizontal(this._orient) ? this._railStyle.height : this._railStyle.width) ?? RailDefaultSize[1];

    // 1. 计算所有组件自身占据的宽度 or 高度
    const controllerPx = controllers.reduce((len, controller) => {
      const size = controller.style.size;
      const maxSize = isNumber(size) ? size : max(size[0], size[1]);
      return len + controller.space + maxSize;
    }, 0);

    // 2. 计算slider的总占据像素
    const sliderPx = this._sliderVisible
      ? (isHorizontal(this._orient) ? this._size?.width : this._size?.height) - controllerPx
      : 0;

    // 3. 计算slider滑轨的总占据像素
    const railPx = sliderPx - this.attribute.slider.space;

    // 4. 计算起点控件坐标
    const startPx = startControllers.reduce((px, controller) => {
      const {
        key,
        space,
        style: { size }
      } = controller;
      const maxSize = isNumber(size) ? size : max(size[0], size[1]);
      this._layoutInfo[key] = {
        ...this._layoutInfo[key],
        size: maxSize,
        x: isHorizontal(this._orient) ? px + space : (this._size.width - maxSize) / 2,
        y: isHorizontal(this._orient) ? (this._size.height - maxSize) / 2 : px + space
      };
      return px + space + maxSize;
    }, 0);

    // 5. 计算slider的起点坐标
    this._layoutInfo.slider = {
      ...this._layoutInfo.slider,
      size: railPx,
      x: isHorizontal(this._orient)
        ? startPx + this.attribute.slider.space
        : (this._size.width - railSectionLength) / 2,
      y: isHorizontal(this._orient)
        ? (this._size.height - railSectionLength) / 2
        : startPx + this.attribute.slider.space
    };

    // 6. 计算终点控件坐标
    endControllers.reduce((px, controller) => {
      const {
        key,
        space,
        style: { size }
      } = controller;
      const maxSize = isNumber(size) ? size : max(size[0], size[1]);
      this._layoutInfo[key] = {
        ...this._layoutInfo[key],
        size: maxSize,
        x: isHorizontal(this._orient) ? px + space : (this._size.width - maxSize) / 2,
        y: isHorizontal(this._orient) ? (this._size.height - maxSize) / 2 : px + space
      };
      return px + space + maxSize;
    }, startPx + sliderPx);
  }

  /**
   * 初始化滑动条
   */
  private _updateSliderAttrs = () => {
    let handlerSize;
    if (isValidNumber(this._handlerStyle.size)) {
      handlerSize = this._handlerStyle.size;
    } else if (this._handlerStyle.size && this._handlerStyle.size.length) {
      handlerSize = max(this._handlerStyle.size[0], this._handlerStyle.size[1]);
    }

    const attrs: SliderAttributes = {
      visible: this._sliderVisible,
      // 重要参数
      min: this._minIndex,
      max: this._maxIndex,
      value: this._dataIndex,
      railWidth: this._railStyle.width,
      railHeight: this._railStyle.height,
      railStyle: this._railStyle,
      trackStyle: this._trackStyle,
      handlerSize: isValidNumber(handlerSize) ? handlerSize : undefined,
      handlerStyle: this._handlerStyle,
      // 不重要, 但需要预设的参数
      dy: this.attribute.slider.dy,
      dx: this.attribute.slider.dx,
      slidable: true,
      range: false,
      handlerText: { visible: false },
      startText: { visible: false },
      endText: { visible: false },
      disableTriggerEvent: this.attribute.disableTriggerEvent
    };

    // 横向布局
    if (isHorizontal(this._orient)) {
      // 滑动条水平居中
      const railWidth = Math.max(0, this._layoutInfo.slider.size);
      const railHeight = this._railStyle.height ?? RailDefaultSize[1];

      // 属性修改
      attrs.layout = 'horizontal';
      attrs.railHeight = railHeight;
      attrs.railWidth = railWidth;
      attrs.x = this._layoutInfo.slider.x;
      attrs.y = this._layoutInfo.slider.y;
    }
    // 纵向布局
    else {
      // 滑动条垂直居中
      const railHeight = Math.max(0, this._layoutInfo.slider.size);
      const railWidth = this._railStyle.width ?? RailDefaultSize[1];

      // 属性修改
      attrs.layout = 'vertical';
      attrs.railWidth = railWidth;
      attrs.railHeight = railHeight;
      attrs.x = this._layoutInfo.slider.x;
      attrs.y = this._layoutInfo.slider.y;
    }
    return attrs;
  };

  private _initSlider = () => {
    const attrs = this._updateSliderAttrs();
    this._slider = new Slider(attrs);
    if (this._sliderVisible) {
      this.add(this._slider as unknown as INode);
    }
  };

  /**
   * 初始化控制器
   */
  private _updateControllerAttrs = () => {
    const attrs: ControllerAttributes = {
      start: this._start,
      pause: this._pause,
      forward: this._forward,
      backward: this._backward,
      disableTriggerEvent: this.attribute.disableTriggerEvent
    };
    // 横向布局
    attrs.layout = isHorizontal(this._orient) ? 'horizontal' : 'vertical';
    attrs.start = {
      ...attrs.start,
      style: {
        ...attrs.start.style,
        x: this._layoutInfo.start.x,
        y: this._layoutInfo.start.y
      }
    };
    attrs.pause = {
      ...attrs.pause,
      // 暂停按钮, 复用开始按钮的布局
      style: {
        ...attrs.pause.style,
        x: this._layoutInfo.start.x,
        y: this._layoutInfo.start.y
      }
    };
    attrs.backward = {
      ...attrs.backward,
      style: {
        ...attrs.backward.style,
        x: this._layoutInfo.backward.x,
        y: this._layoutInfo.backward.y
      }
    };
    attrs.forward = {
      ...attrs.forward,
      style: {
        ...attrs.forward.style,
        x: this._layoutInfo.forward.x,
        y: this._layoutInfo.forward.y
      }
    };
    return attrs;
  };

  private _initController = () => {
    const attrs = this._updateControllerAttrs();
    this._controller = new Controller(attrs);
    if (this._controllerVisible) {
      this.add(this._controller as unknown as INode);
    }
  };

  /**
   * 渲染
   */
  render() {
    this._initLayoutInfo();
    this.renderSlider();
    this.renderController();
  }

  /**
   * 更新滑动条
   */
  renderSlider() {
    const attrs = this._updateSliderAttrs();
    this._slider.setAttributes(attrs);
  }

  /**
   * 更新控制器
   */
  renderController() {
    const attrs = this._updateControllerAttrs();
    this._controller.setAttributes(attrs);
  }

  /**
   * 触发事件
   * @param eventType 事件类型
   * @param dataIndex 数据下标
   */
  dispatchCustomEvent(eventType: PlayerEventEnum, dataIndex: number) {
    this._dispatchEvent(eventType, {
      eventType,
      index: dataIndex,
      value: this._data[dataIndex]
    });
  }
}
