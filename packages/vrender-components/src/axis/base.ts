/**
 * TODO:
 * 1. trunk 坐标轴截断
 * @description 坐标轴组件基类
 */
import type {
  IGroup,
  INode,
  ITextGraphicAttribute,
  TextAlignType,
  TextBaselineType,
  FederatedPointerEvent,
  IGraphic,
  IText
} from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { graphicCreator } from '@visactor/vrender-core';
import type { Dict } from '@visactor/vutils';
// eslint-disable-next-line no-duplicate-imports
import { abs, cloneDeep, get, isEmpty, isFunction, merge, pi } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { Point } from '../core/type';
import type { TagAttributes } from '../tag';
import { createTextGraphicByType } from '../util';
import { DEFAULT_STATES } from '../constant';
import { AXIS_ELEMENT_NAME } from './constant';
import { DEFAULT_AXIS_THEME } from './config';
import type {
  LabelAttributes,
  AxisBaseAttributes,
  AxisItem,
  TickAttributes,
  TransformedAxisItem,
  SubTickAttributes,
  TickLineItem,
  callbackFunc
} from './type';
import { Tag } from '../tag/tag';
import { getElMap, getVerticalCoord } from './util';
import { dispatchClickState, dispatchHoverState, dispatchUnHoverState } from '../util/interaction';

export abstract class AxisBase<T extends AxisBaseAttributes> extends AbstractComponent<Required<T>> {
  name = 'axis';

  // TODO: 组件整体统一起来
  protected _innerView: IGroup;
  getInnerView() {
    return this._innerView;
  }

  protected _prevInnerView: { [key: string]: IGraphic }; // 缓存旧场景树，用于自定义动画
  /**
   * 获取更新前的旧场景树
   * @returns 返回更新前的旧场景树
   */
  getPrevInnerView() {
    return this._prevInnerView;
  }

  // 经过处理后的坐标轴点数据
  protected data: TransformedAxisItem[] = [];
  protected tickLineItems: TickLineItem[] = [];
  protected subTickLineItems: TickLineItem[] = [];
  protected axisLabelLayerSize: Dict<{
    width: number;
    height: number;
    textAlign: string;
    textBaseline: string;
    labelPos: number;
  }> = {};
  protected axisLabelsContainer: IGroup | null = null;
  protected axisContainer: IGroup;

  private _lastHover: IGraphic;
  private _lastSelect: IGraphic;

  protected abstract renderLine(container: IGroup): void;
  abstract isInValidValue(value: number): boolean;
  abstract getTickCoord(value: number): Point;
  abstract getVerticalVector(offset: number, inside: boolean, point: Point): [number, number];
  abstract getRelativeVector(point?: Point): [number, number];
  protected abstract getTitleAttribute(): TagAttributes;
  protected abstract beforeLabelsOverlap(
    labelShapes: IText[],
    labelData: AxisItem[],
    labelContainer: IGroup,
    layer: number,
    layerCount: number
  ): void;
  protected abstract handleLabelsOverlap(
    labelShapes: IText[],
    labelData: AxisItem[],
    labelContainer: IGroup,
    layer: number,
    layerCount: number
  ): void;
  protected abstract afterLabelsOverlap(
    labelShapes: IText[],
    labelData: AxisItem[],
    labelContainer: IGroup,
    layer: number,
    layerCount: number
  ): void;
  protected abstract getLabelAlign(
    vector: [number, number],
    inside?: boolean,
    angle?: number
  ): { textAlign: TextAlignType; textBaseline: TextBaselineType };

  /**
   * 坐标轴的一个特殊的方法，用于不更新场景树来获取更新属性后的包围盒
   * TODO：后面看情况再抽象为通用的方法
   */
  getBoundsWithoutRender(attributes: Partial<T>) {
    const currentAttribute = cloneDeep(this.attribute);
    merge(this.attribute, attributes);

    const offscreenGroup = graphicCreator.group({
      x: this.attribute.x,
      y: this.attribute.y
    });
    this.add(offscreenGroup);

    this._renderInner(offscreenGroup);

    this.removeChild(offscreenGroup);
    this.attribute = currentAttribute;
    return offscreenGroup.AABBBounds;
  }

  protected render(): void {
    this._prevInnerView = this._innerView && getElMap(this._innerView);
    this.removeAllChild(true);
    this._innerView = graphicCreator.group({ x: 0, y: 0, pickable: false });
    this.add(this._innerView);

    this._renderInner(this._innerView);

    this._bindEvent();
  }

  private _bindEvent() {
    if (this.attribute.disableTriggerEvent) {
      return;
    }
    const { hover, select } = this.attribute;

    if (hover) {
      this._innerView.addEventListener('pointermove', this._onHover as EventListenerOrEventListenerObject);
      this._innerView.addEventListener('pointerout', this._onUnHover as EventListenerOrEventListenerObject);
    }

    if (select) {
      this._innerView.addEventListener('pointerdown', this._onClick as EventListenerOrEventListenerObject);
    }
  }

  private _onHover = (e: FederatedPointerEvent) => {
    this._lastHover = dispatchHoverState(e, this.axisContainer, this._lastHover);
  };

  private _onUnHover = (e: FederatedPointerEvent) => {
    this._lastHover = dispatchUnHoverState(e, this.axisContainer, this._lastHover);
  };

  private _onClick = (e: FederatedPointerEvent) => {
    this._lastSelect = dispatchClickState(e, this.axisContainer, this._lastSelect);
  };

  protected _renderInner(container: IGroup) {
    const { title, label, tick, line, items } = this.attribute;

    const axisContainer = graphicCreator.group({ x: 0, y: 0, zIndex: 1, pickable: false });
    axisContainer.name = AXIS_ELEMENT_NAME.axisContainer;
    axisContainer.id = this._getNodeId('container');
    axisContainer.setMode(this.mode);
    this.axisContainer = axisContainer;
    container.add(axisContainer);

    // 渲染轴线
    if (line && line.visible) {
      this.renderLine(axisContainer);
    }

    if (items && items.length) {
      this.data = this._transformItems(items[0]);

      // 渲染刻度线，包含子刻度线
      if (tick && tick.visible) {
        this.renderTicks(axisContainer);
      }
      // 渲染标签
      if (label && label.visible) {
        const labelGroup = graphicCreator.group({ x: 0, y: 0, pickable: false });
        labelGroup.name = AXIS_ELEMENT_NAME.labelContainer;
        labelGroup.id = this._getNodeId('label-container');
        this.axisLabelsContainer = labelGroup;
        axisContainer.add(labelGroup);
        items.forEach((axisItems: AxisItem[], layer: number) => {
          const layerLabelGroup = this.renderLabels(labelGroup, axisItems, layer);

          const labels = layerLabelGroup.getChildren() as IText[];
          this.beforeLabelsOverlap(labels, axisItems, layerLabelGroup, layer, items.length);
          // handle overlap
          this.handleLabelsOverlap(labels, axisItems, layerLabelGroup, layer, items.length);
          this.afterLabelsOverlap(labels, axisItems, layerLabelGroup, layer, items.length);

          let maxTextWidth = 0;
          let maxTextHeight = 0;
          let textAlign = 'center';
          let textBaseline = 'middle';
          let labelPos: number = 0;
          labels.forEach((label: IText, index) => {
            const labelStyle = label.attribute;

            const angle = labelStyle.angle ?? 0;
            const textBounds = label.AABBBounds;
            let textWidth = textBounds.width();
            let textHeight = textBounds.height();
            if (angle) {
              textWidth = Math.abs(textWidth * Math.cos(angle));
              textHeight = Math.abs(textHeight * Math.sin(angle));
            }
            maxTextWidth = Math.max(maxTextWidth, textWidth);
            maxTextHeight = Math.max(maxTextHeight, textHeight);

            textAlign = labelStyle.textAlign as string;
            textBaseline = labelStyle.textBaseline as string;
            if (index === 0) {
              labelPos = labelStyle.x;
            }
          });
          this.axisLabelLayerSize[layer] = {
            width: maxTextWidth,
            height: maxTextHeight,

            labelPos,
            textAlign,
            textBaseline
          };
        });
      }
    }

    // 渲染标题
    if (title && title.visible) {
      this.renderTitle(axisContainer);
    }
  }
  protected renderTicks(container: IGroup) {
    const tickLineItems = this.getTickLineItems();

    const tickLineGroup = graphicCreator.group({ x: 0, y: 0, pickable: false });
    tickLineGroup.name = AXIS_ELEMENT_NAME.tickContainer;
    tickLineGroup.id = this._getNodeId('tick-container');
    container.add(tickLineGroup);

    tickLineItems.forEach((item: TickLineItem, index) => {
      const line = graphicCreator.line({
        ...this._getTickLineAttribute('tick', item, index, tickLineItems)
      });
      line.name = AXIS_ELEMENT_NAME.tick;
      line.id = this._getNodeId(item.id);

      if (isEmpty(this.attribute.tick?.state)) {
        line.states = DEFAULT_STATES;
      } else {
        const data = this.data[index];
        const tickLineState = merge({}, DEFAULT_STATES, this.attribute.tick.state);
        Object.keys(tickLineState).forEach(key => {
          if (isFunction(tickLineState[key])) {
            tickLineState[key] = tickLineState[key](data.rawValue, index, data, this.data);
          }
        });
        line.states = tickLineState;
      }

      tickLineGroup.add(line);
    });
    this.tickLineItems = tickLineItems;

    // subTick 处理
    const { subTick } = this.attribute;
    if (subTick && subTick.visible) {
      const subTickLineItems: TickLineItem[] = this.getSubTickLineItems();
      if (subTickLineItems.length) {
        subTickLineItems.forEach((item: TickLineItem, index) => {
          const line = graphicCreator.line({
            ...this._getTickLineAttribute('subTick', item, index, tickLineItems)
          });
          line.name = AXIS_ELEMENT_NAME.subTick;
          line.id = this._getNodeId(`${index}`);

          if (isEmpty(subTick.state)) {
            line.states = DEFAULT_STATES;
          } else {
            const subTickLineState = merge({}, DEFAULT_STATES, subTick.state);
            Object.keys(subTickLineState).forEach(key => {
              if (isFunction(subTickLineState[key])) {
                subTickLineState[key] = subTickLineState[key](item.value, index, item, tickLineItems);
              }
            });
            line.states = subTickLineState;
          }

          tickLineGroup.add(line);
        });
      }

      this.subTickLineItems = subTickLineItems;
    }
  }

  protected renderLabels(container: IGroup, items: AxisItem[], layer: number) {
    const { dataFilter } = this.attribute.label;
    if (dataFilter && isFunction(dataFilter)) {
      items = dataFilter(items, layer) as TransformedAxisItem[];
    }
    const data = this._transformItems(items);

    const labelGroup = graphicCreator.group({ x: 0, y: 0, pickable: false });
    labelGroup.name = `${AXIS_ELEMENT_NAME.labelContainer}-layer-${layer}`;
    labelGroup.id = this._getNodeId(`label-container-layer-${layer}`);
    container.add(labelGroup);

    data.forEach((item: TransformedAxisItem, index: number) => {
      const labelStyle: any = this._getLabelAttribute(item, index, data, layer);
      const text = createTextGraphicByType(labelStyle);

      text.name = AXIS_ELEMENT_NAME.label;
      text.id = this._getNodeId(`layer${layer}-label-${item.id}`);
      if (isEmpty(this.attribute.label?.state)) {
        text.states = DEFAULT_STATES;
      } else {
        const labelState = merge({}, DEFAULT_STATES, this.attribute.label.state);
        Object.keys(labelState).forEach(key => {
          if (isFunction(labelState[key])) {
            labelState[key] = labelState[key](item, index, data, layer);
          }
        });
        text.states = labelState;
      }
      text.data = { ...item, index, layer };
      labelGroup.add(text);
    });

    return labelGroup;
  }

  protected renderTitle(container: IGroup) {
    const titleAttributes = this.getTitleAttribute();
    const axisTitle = new Tag({
      ...titleAttributes
    });
    axisTitle.name = AXIS_ELEMENT_NAME.title;
    axisTitle.id = this._getNodeId('title');
    container.add(axisTitle as unknown as INode);
  }

  protected getVerticalCoord(point: Point, offset: number, inside: boolean): Point {
    return getVerticalCoord(point, this.getVerticalVector(offset, inside, point));
  }

  protected getTickLineItems() {
    const { tick } = this.attribute;
    const data = this.data;
    // tick 处理
    const tickLineItems: TickLineItem[] = [];
    const { alignWithLabel, inside = false, length, dataFilter } = tick as TickAttributes;
    let tickSegment = 1;
    const count = data.length;
    if (count >= 2) {
      tickSegment = data[1].value - data[0].value;
    }

    (dataFilter && isFunction(dataFilter) ? dataFilter(data) : data).forEach((item: TransformedAxisItem) => {
      let point = item.point;
      let tickValue = item.value;
      if (!alignWithLabel) {
        const value = item.value - tickSegment / 2;
        if (this.isInValidValue(value)) {
          return;
        }
        point = this.getTickCoord(value);
        tickValue = value;
      }
      const endPoint = this.getVerticalCoord(point, length as number, inside);

      if (this.mode === '3d') {
        const vec = this.getVerticalVector(length as number, inside, point);
        let alpha = 0;
        let beta = 0;
        if (abs(vec[0]) > abs(vec[1])) {
          alpha = (pi / 2) * (endPoint.x > point.x ? 1 : -1);
        } else {
          beta = (pi / 2) * (endPoint.y > point.y ? -1 : 1);
        }
        tickLineItems.push({
          start: point,
          end: endPoint,
          value: tickValue,
          id: `tick-${item.id}`,
          anchor: [point.x, point.y],
          alpha,
          beta
        });
      } else {
        tickLineItems.push({
          start: point,
          end: endPoint,
          value: tickValue,
          id: `tick-${item.id}`
        });
      }
    });

    return tickLineItems;
  }

  protected getSubTickLineItems() {
    const { subTick } = this.attribute as AxisBaseAttributes;
    const subTickLineItems: TickLineItem[] = [];
    const { count: subCount = 4, inside = false, length = 2 } = subTick as SubTickAttributes;
    const tickLineItems = this.tickLineItems;
    const tickLineCount = tickLineItems.length;

    if (tickLineCount >= 2) {
      for (let i = 0; i < tickLineCount - 1; i++) {
        const pre = tickLineItems[i];
        const next = tickLineItems[i + 1];
        for (let j = 0; j < subCount; j++) {
          const percent = (j + 1) / (subCount + 1);
          const value = (1 - percent) * pre.value + percent * next.value;
          const point = this.getTickCoord(value);
          const endPoint = this.getVerticalCoord(point, length, inside);
          subTickLineItems.push({
            start: point,
            end: endPoint,
            value,
            id: `sub-tick-${value}`
          });
        }
      }
    }

    return subTickLineItems;
  }

  private _getTickLineAttribute(type: string, tickItem: TickLineItem, index: number, tickItems: TickLineItem[]) {
    let style = get(this.attribute, `${type}.style`);
    const data = this.data[index];
    style = isFunction(style)
      ? merge(
          {},
          get(DEFAULT_AXIS_THEME, `${type}.style`),
          type === 'tick'
            ? style(data.rawValue, index, data, this.data)
            : style(tickItem.value, index, tickItem, tickItems)
        )
      : style;

    const { start, end, anchor, alpha, beta } = tickItem;
    return {
      points: [start, end],
      anchor,
      alpha,
      beta,
      ...style
    };
  }

  private _getLabelAttribute(
    tickDatum: TransformedAxisItem,
    index: number,
    tickData: TransformedAxisItem[],
    layer: number
  ) {
    const { space = 4, inside = false, formatMethod, type = 'text', text } = this.attribute.label as LabelAttributes;
    let offset = space;
    let tickLength = 0;
    if (this.attribute.tick?.visible && this.attribute.tick.inside === inside) {
      tickLength = this.attribute.tick.length || 4;
    }
    if (this.attribute.subTick?.visible && this.attribute.subTick.inside === inside) {
      tickLength = Math.max(tickLength, this.attribute.subTick.length || 2);
    }
    offset += tickLength;

    // 先测试 line
    const axisVector = this.getRelativeVector(tickDatum.point);
    if (layer > 0) {
      if (axisVector[1] === 0) {
        offset += (this.axisLabelLayerSize[layer - 1].height + get(this.attribute, 'label.space', 4)) * layer;
      } else {
        offset += (this.axisLabelLayerSize[layer - 1].width + get(this.attribute, 'label.space', 4)) * layer;
      }
    }

    const point = this.getVerticalCoord(tickDatum.point, offset, inside);
    const vector = this.getVerticalVector(offset || 1, inside, point);
    const textContent = formatMethod
      ? formatMethod(`${tickDatum.label}`, tickDatum, index, tickData, layer)
      : tickDatum.label;
    let { style: textStyle } = this.attribute.label as LabelAttributes;
    textStyle = isFunction(textStyle)
      ? merge(
          {},
          DEFAULT_AXIS_THEME.label.style,
          (textStyle as callbackFunc<Partial<ITextGraphicAttribute> | undefined>)(tickDatum, index, tickData, layer)
        )
      : textStyle;

    const labelAlign = this.getLabelAlign(vector, inside, (textStyle as ITextGraphicAttribute).angle);
    textStyle = merge(labelAlign, textStyle) as Partial<ITextGraphicAttribute>;
    // 兼容原先 style.text 回调的方式
    if (isFunction(textStyle.text)) {
      // @ts-ignore
      textStyle.text = textStyle.text({
        label: tickDatum.label,
        value: tickDatum.rawValue,
        index: tickDatum.index,
        layer
      });
    }
    return {
      ...this.getLabelPosition(point, vector, textContent, textStyle),
      text: text ?? textContent,
      _originText: tickDatum.label,
      lineHeight: textStyle?.fontSize,
      type,
      ...textStyle
    };
  }

  protected getLabelPosition(
    point: Point,
    vector: [number, number],
    text: string | number,
    style: Partial<ITextGraphicAttribute>
  ) {
    return point;
  }

  private _transformItems(items: AxisItem[]) {
    const data: TransformedAxisItem[] = [];
    items.forEach((item: AxisItem) => {
      data.push({
        ...item,
        point: this.getTickCoord(item.value),
        id: item.id ?? item.label
      });
    });
    return data;
  }

  release(): void {
    super.release();
    this._prevInnerView = null;
    this._innerView = null;
  }
}
