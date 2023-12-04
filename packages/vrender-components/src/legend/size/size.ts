/**
 * @description 连续尺寸图例
 */
import type { FederatedPointerEvent, INode } from '@visactor/vrender/es/core';
import { graphicCreator } from '@visactor/vrender/es/core';
import { merge, get } from '@visactor/vutils';
import { LegendBase } from '../base';
import { Slider } from '../../slider';
import { DEFAULT_TITLE_SPACE } from '../constant';
import type { ComponentOptions } from '../../interface';
import type { SizeLegendAttributes } from './type';
import { getSizeHandlerPath } from '../util';
import { loadSizeContinuousLegend } from '../register';

loadSizeContinuousLegend();
export class SizeContinuousLegend extends LegendBase<SizeLegendAttributes> {
  name = 'sizeLegend';

  static defaultAttributes = {
    layout: 'horizontal',
    title: {
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
      lineWidth: 1,
      stroke: '#ccc',
      fill: '#fff'
    },
    sizeBackground: {
      fill: 'rgba(20,20,20,0.1)'
    }
  };

  private _slider!: Slider;

  constructor(attributes: SizeLegendAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, SizeContinuousLegend.defaultAttributes, attributes));
  }

  setSelected(value: number[]) {
    if (!this._slider) {
      return;
    }
    this._slider.setValue(value);
  }

  protected _renderContent(): void {
    const {
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
      sizeBackground,
      disableTriggerEvent
    } = this.attribute as SizeLegendAttributes;
    const isHorizontal = layout === 'horizontal';

    const mainContainer = graphicCreator.group({
      x: 0,
      y: 0
    });
    this._innerView.add(mainContainer);

    const slider = new Slider({
      x: 0,
      y: 0,
      zIndex: 1,
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
      handlerStyle: {
        symbolType: getSizeHandlerPath(align),
        ...handlerStyle
      },
      railStyle,
      trackStyle,
      startText,
      endText,
      handlerText,
      showTooltip,
      tooltip,
      disableTriggerEvent
    });
    mainContainer.add(slider as unknown as INode);

    // 绘制 size 背景
    let start = 0;
    let path;
    const backgroundHeight = 12; // 目前暂不开放配置
    if (layout === 'horizontal') {
      if (align === 'top') {
        path = `M0,0L${railWidth},0L${railWidth},${backgroundHeight}Z`;
        start = railHeight;
      } else {
        path = `M0,${backgroundHeight}L${railWidth},${backgroundHeight}L${railWidth},0Z`;
        slider.setAttribute('y', backgroundHeight);
      }
    } else {
      if (align === 'left') {
        path = `M${railWidth},0L${railWidth},0L${
          railWidth + backgroundHeight
        },${railHeight}L${railWidth},${railHeight}Z`;
      } else {
        path = `M0,${railHeight}L${backgroundHeight},${railHeight}L${backgroundHeight},0Z`;
        slider.setAttribute('x', backgroundHeight);
      }
    }
    const background = graphicCreator.path({
      x: 0,
      y: start,
      path,
      ...sizeBackground,
      zIndex: 0
    });
    mainContainer.add(background);

    // 做下位置调整
    const titleSpace = this._title
      ? this._title.AABBBounds.height() + get(this.attribute, 'title.space', DEFAULT_TITLE_SPACE)
      : 0;

    mainContainer.translate(0 - mainContainer.AABBBounds.x1, titleSpace - mainContainer.AABBBounds.y1);

    this._slider = slider;
  }

  protected _bindEvents(): void {
    if (this.attribute.disableTriggerEvent) {
      return;
    }
    if (this._slider) {
      this._slider.addEventListener('change', this._onSliderChange as EventListenerOrEventListenerObject);
    }
  }

  private _onSliderChange = (e: FederatedPointerEvent) => {
    this.dispatchEvent(e);
  };
}
