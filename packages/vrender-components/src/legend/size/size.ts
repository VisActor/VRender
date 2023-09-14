/**
 * @description 连续尺寸图例
 */
import type { FederatedPointerEvent, INode } from '@visactor/vrender';
import { createGroup, createPath } from '@visactor/vrender';
import { merge, get } from '@visactor/vutils';
import { LegendBase } from '../base';
import { Slider } from '../../slider';
import { DEFAULT_TITLE_SPACE } from '../constant';
import type { OrientType } from '../../interface';
import type { SizeLegendAttributes } from './type';

export function getSizeHandlerPath(align: OrientType = 'bottom') {
  let centerX = 0;
  const centerY = 0;
  const upperHalf = 3.5;
  const leftHalf = 2.5;
  const arrowY = 6;

  if (align === 'top') {
    return `
    M${centerX},${centerY - arrowY}L${centerX - upperHalf},${centerY - leftHalf}
    v${2 * leftHalf}
    h${2 * upperHalf}
    v${-2 * leftHalf}
    Z
`;
  }

  if (align === 'left') {
    centerX = 1;
    return `
    M${centerX - arrowY},${centerY}L${centerX - arrowY + leftHalf},${centerY - upperHalf}
    h${2 * leftHalf}
    v${2 * upperHalf}
    h${-2 * leftHalf}
    Z
`;
  }

  if (align === 'right') {
    centerX = -1;

    return `
    M${centerX + arrowY},${centerY}L${centerX + arrowY - leftHalf},${centerY - upperHalf}
    h${-2 * leftHalf}
    v${2 * upperHalf}
    h${2 * leftHalf}
    Z
  `;
  }

  return `
    M${centerX},${centerY + arrowY}L${centerX - upperHalf},${centerY + leftHalf}
    v${-2 * leftHalf}
    h${2 * upperHalf}
    v${2 * leftHalf}
    Z
`;
}

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

  constructor(attributes: SizeLegendAttributes) {
    super(merge({}, SizeContinuousLegend.defaultAttributes, attributes));
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
      sizeBackground
    } = this.attribute as SizeLegendAttributes;
    const isHorizontal = layout === 'horizontal';

    const mainContainer = createGroup({
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
      tooltip
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
    const background = createPath({
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
    if (this._slider) {
      this._slider.addEventListener('change', this._onSliderChange as EventListenerOrEventListenerObject);
    }
  }

  private _onSliderChange = (e: FederatedPointerEvent) => {
    this.dispatchEvent(e);
  };
}
