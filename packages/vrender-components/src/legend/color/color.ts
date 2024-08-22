/**
 * @description 连续颜色图例
 * TODO:
 * showHandlers 测试
 */
import { merge, isEmpty, get, isNil } from '@visactor/vutils';
import type { FederatedPointerEvent, FederatedEvent, IColor, ILinearGradient, INode } from '@visactor/vrender-core';
import type { ILinearScale } from '@visactor/vscale';
import { LinearScale } from '@visactor/vscale';
import { LegendBase } from '../base';
import { Slider } from '../../slider';
import { DEFAULT_TITLE_SPACE } from '../constant';
import type { ColorLegendAttributes } from './type';
import type { ComponentOptions } from '../../interface';
import { loadColorContinuousLegendComponent } from '../register';

loadColorContinuousLegendComponent();
export class ColorContinuousLegend extends LegendBase<ColorLegendAttributes> {
  name = 'colorLegend';

  static defaultAttributes = {
    layout: 'horizontal',
    title: {
      // orient: 'top',
      align: 'start',
      space: DEFAULT_TITLE_SPACE,
      textStyle: {
        fontSize: 12,
        fontWeight: 'bold',
        fill: 'rgba(46, 47, 50, 1)'
      }
    },
    handlerSize: 10,
    handlerStyle: {
      fill: null as any,
      lineWidth: 4,
      stroke: '#fff',
      outerBorder: {
        distance: 2,
        lineWidth: 1,
        stroke: '#ccc'
      }
    },
    tooltip: {
      shapeStyle: {
        lineWidth: 4,
        stroke: '#fff'
      }
    }
  };

  private _slider!: Slider;
  private _colorScale!: ILinearScale;
  private _color: IColor | undefined;

  constructor(attributes: ColorLegendAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, ColorContinuousLegend.defaultAttributes, attributes));
  }

  /**
   * 更新数据选中范围
   * @param value 选中数据范围
   * @returns
   */
  setSelected(value: number[]) {
    if (!this._slider) {
      return;
    }
    this._slider.setValue(value);
    this._updateColor();
  }

  protected _renderContent(): void {
    const {
      colors,
      slidable,
      layout,
      align,
      min,
      max,
      value,
      railWidth,
      railHeight,
      showHandler = true,
      handlerSize,
      handlerStyle,
      railStyle,
      trackStyle,
      startText,
      endText,
      handlerText,
      showTooltip,
      tooltip,
      inverse,
      disableTriggerEvent
    } = this.attribute as ColorLegendAttributes;

    // 创建 colorScale
    const domain = [];
    const step = (max - min) / (colors.length - 1);
    for (let i = 0; i < colors.length; i++) {
      domain.push(min + step * i);
    }

    this._colorScale = new LinearScale().domain(domain, true).range(colors);
    this._color = this._getTrackColor();

    const slider = new Slider({
      x: 0,
      y: 0,
      range: {
        draggableTrack: true
      },
      slidable,
      layout,
      align,
      min,
      max,
      value,
      railWidth,
      railHeight,
      showHandler,
      handlerSize,
      handlerStyle,
      railStyle,
      trackStyle: {
        fill: this._color,
        ...trackStyle
      },
      startText,
      endText,
      handlerText,
      showTooltip,
      tooltip,
      disableTriggerEvent,
      inverse
    });
    this._innerView.add(slider as unknown as INode);
    this._slider = slider;
    // 做下位置调整，对齐
    slider.translateTo(
      0 - slider.AABBBounds.x1,
      (this._title ? this._title.AABBBounds.height() + get(this.attribute, 'title.space', DEFAULT_TITLE_SPACE) : 0) -
        slider.AABBBounds.y1
    );
    this._updateColor();
  }

  protected _bindEvents(): void {
    if (this.attribute.disableTriggerEvent) {
      return;
    }
    if (this._slider) {
      this._slider.addEventListener('change', this._onSliderChange as EventListenerOrEventListenerObject);
      this._slider.addEventListener('sliderTooltip', this._onSliderToolipChange as EventListenerOrEventListenerObject);
    }
  }

  private _getTrackColor(): IColor | undefined {
    const { colors, layout, inverse } = this.attribute as ColorLegendAttributes;

    if (isEmpty(colors)) {
      return undefined;
    }
    const count = colors.length;
    if (count === 1) {
      return colors[0];
    }
    const stops = [];

    for (let i = 0; i < count; i++) {
      const percent = i / (count - 1);
      stops.push({
        offset: percent,
        color: colors[i]
      });
    }
    const isHorizontal = layout === 'horizontal';

    const res: IColor = {
      gradient: 'linear',
      stops,
      x0: 0,
      y0: 0,
      x1: isHorizontal ? 1 : 0,
      y1: isHorizontal ? 0 : 1
    };

    if (inverse) {
      if (isHorizontal) {
        res.x0 = 1;
        res.x1 = 0;
      } else {
        res.y0 = 1;
        res.y1 = 0;
      }
    }

    return res;
  }

  private _onSliderToolipChange = (e: FederatedEvent) => {
    const tooltipShape = this._slider.tooltipShape;

    if (tooltipShape && e.detail && !isNil(e.detail.value)) {
      const color = this._colorScale.scale(e.detail.value);

      tooltipShape.setAttribute('fill', color);
    }

    this.dispatchEvent(e);
  };

  private _onSliderChange = (e: FederatedEvent) => {
    // 更新 handler 以及 track 的渐变色
    this._updateColor();
    this.dispatchEvent(e);
  };

  private _updateColor() {
    const { layout = 'horizontal', colors, railWidth, railHeight } = this.attribute as ColorLegendAttributes;
    const { startHandler, endHandler, track, attribute } = this._slider;
    const { startValue, endValue, startPos, endPos } = this._slider.currentValue;
    const handlerColor = attribute.handlerStyle?.fill;
    // 计算颜色
    if (startHandler && !handlerColor) {
      const startHandlerColor = this._colorScale.scale(startValue);
      startHandler.setAttribute('fill', startHandlerColor);
    }

    if (endHandler && !handlerColor) {
      const endHandlerColor = this._colorScale.scale(endValue);
      endHandler.setAttribute('fill', endHandlerColor);
    }

    const isHorizontal = layout === 'horizontal';
    const railLen = isHorizontal ? railWidth : railHeight;
    const trackLength = Math.abs((startPos as number) - (endPos as number));

    // 计算渐变色
    if (trackLength !== railLen && colors && colors.length > 1) {
      const stops = (this._color as ILinearGradient).stops;
      const start = Math.min(startPos as number, endPos as number);
      const end = Math.max(startPos as number, endPos as number);
      const startRatio = start / railLen;
      const endRatio = end / railLen;
      const range = endRatio - startRatio;
      const betweenStops = stops.filter(stop => stop.offset > startRatio && stop.offset < endRatio);

      const minValue = Math.min(startValue, endValue);
      const maxValue = Math.max(startValue, endValue);
      const startColor = this._colorScale.scale(minValue);
      const endColor = this._colorScale.scale(maxValue);
      const newStops = [{ offset: 0, color: startColor }];
      betweenStops.forEach(stop => {
        newStops.push({
          offset: (stop.offset - startRatio) / range,
          color: stop.color
        });
      });
      newStops.push({
        offset: 1,
        color: endColor
      });
      track.setAttribute('fill', {
        ...(this._color as ILinearGradient),
        stops: newStops
      });
    }
  }
}
