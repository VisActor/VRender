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
  IGraphic
} from '@visactor/vrender';
import { createLine, createText, createGroup, createRect } from '@visactor/vrender';
import type { Dict } from '@visactor/vutils';
import { abs, cloneDeep, get, isEmpty, isFunction, isNumberClose, merge, pi } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { Point } from '../core/type';
import type { TagAttributes } from '../tag';
import { traverseGroup } from '../util';
import { DEFAULT_STATES, StateValue } from '../constant';
import { AXIS_ELEMENT_NAME } from './constant';
import { DEFAULT_AXIS_THEME } from './config';
import type {
  GridAttributes,
  LabelAttributes,
  AxisBaseAttributes,
  AxisItem,
  TickAttributes,
  TransformedAxisItem,
  SubTickAttributes,
  TickLineItem
} from './type';
import { Tag } from '../tag/tag';
import { Grid } from './grid';

export abstract class AxisBase<T extends AxisBaseAttributes> extends AbstractComponent<Required<T>> {
  name = 'axis';

  // TODO: 组件整体统一起来
  protected _innerView: IGroup;
  getInnerView() {
    return this._innerView;
  }

  protected _prevInnerView: IGroup; // 缓存旧场景树，用于自定义动画
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
  protected axisLabelLayerSize: Dict<{ width: number; height: number; textAlign: string; textBaseline: string }> = {};
  protected axisLabelsContainer: IGroup | null = null;
  protected axisContainer: IGroup;

  private _lastHover: IGraphic;
  private _lastSelect: IGraphic;

  protected abstract renderLine(container: IGroup): void;
  protected abstract isInValidValue(value: number): boolean;
  protected abstract getTickCoord(value: number): Point;
  protected abstract getVerticalVector(offset: number, inside: boolean, point?: Point): any;
  protected abstract getRelativeVector(point: Point): [number, number];
  protected abstract getTitleAttribute(): TagAttributes;
  protected abstract getGridAttribute(type: string): GridAttributes;
  protected abstract getTextBaseline(vector: [number, number], inside?: boolean): TextBaselineType;

  /**
   * 坐标轴的一个特殊的方法，用于不更新场景树来获取更新属性后的包围盒
   * TODO：后面看情况再抽象为通用的方法
   */
  getBoundsWithoutRender(attributes: Partial<T>) {
    const currentAttribute = cloneDeep(this.attribute);
    merge(this.attribute, attributes);

    const offscreenGroup = createGroup({
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
    this.removeAllChild();
    this._prevInnerView = this._innerView;
    this._innerView = createGroup({ x: 0, y: 0, pickable: false });
    this.add(this._innerView);

    this._renderInner(this._innerView);

    this._bindEvent();
  }

  private _bindEvent() {
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
    const target = e.target as unknown as IGraphic;
    if (target !== this._lastHover && target.name && !isEmpty(target.states)) {
      target.addState(StateValue.hover, true);
      traverseGroup(this.axisContainer, (node: IGraphic) => {
        if (node !== target && node.name && !isEmpty(node.states)) {
          node.addState(StateValue.hoverReverse, true);
        }
      });
      this._lastHover = target;
    }
  };

  private _onUnHover = (e: FederatedPointerEvent) => {
    if (this._lastHover) {
      traverseGroup(this.axisContainer, (node: IGraphic) => {
        if (node.name && !isEmpty(node.states)) {
          node.removeState(StateValue.hoverReverse);
          node.removeState(StateValue.hover);
        }
      });
      this._lastHover = null;
    }
  };

  private _onClick = (e: FederatedPointerEvent) => {
    const target = e.target as unknown as IGraphic;
    if (this._lastSelect === target && target.hasState(StateValue.selected)) {
      // 取消选中
      this._lastSelect = null;
      traverseGroup(this.axisContainer, (node: IGraphic) => {
        if (node.name && !isEmpty(node.states)) {
          node.removeState(StateValue.selectedReverse);
          node.removeState(StateValue.selected);
        }
      });
      return;
    }

    if (target.name && !isEmpty(target.states)) {
      target.addState(StateValue.selected, true);
      traverseGroup(this.axisContainer, (node: IGraphic) => {
        if (node !== target && node.name && !isEmpty(node.states)) {
          node.addState(StateValue.selectedReverse, true);
        }
      });
      this._lastSelect = target;
    }
  };

  private _renderInner(container: IGroup) {
    const { title, label, tick, line, grid, items, panel } = this.attribute;

    const axisContainer = createGroup({ x: 0, y: 0, zIndex: 1 });
    axisContainer.name = AXIS_ELEMENT_NAME.axisContainer;
    axisContainer.id = this._getNodeId('container');
    axisContainer.setMode(this.mode);
    this.axisContainer = axisContainer;
    container.add(axisContainer);

    // 渲染轴线
    if (line?.visible) {
      this.renderLine(axisContainer);
    }

    if (items && items.length) {
      this.data = this._transformItems(items[0]);

      // 渲染刻度线，包含子刻度线
      if (tick?.visible) {
        this.renderTicks(axisContainer);
      }
      // 渲染标签
      if (label?.visible) {
        const labelGroup = createGroup({ x: 0, y: 0, pickable: false });
        labelGroup.name = AXIS_ELEMENT_NAME.labelContainer;
        labelGroup.id = this._getNodeId('label-container');
        this.axisLabelsContainer = labelGroup;
        axisContainer.add(labelGroup);
        items.forEach((axisItems: AxisItem[], layer: number) => {
          this.renderLabels(labelGroup, axisItems, layer);
        });
      }

      // 渲染网格线
      if (grid?.visible) {
        this.renderGrid(container);
      }
    }

    // 渲染标题
    if (title?.visible) {
      this.renderTitle(axisContainer);
    }

    // TODO: 目前是通过包围盒绘制，在一些情况下会有那问题，比如圆弧轴、带了箭头的坐标轴等
    // 坐标轴主体 panel
    if (panel && panel.visible) {
      const axisContainerBounds = axisContainer.AABBBounds;
      const bgRect = createRect({
        x: axisContainerBounds.x1,
        y: axisContainerBounds.y1,
        width: axisContainerBounds.width(),
        height: axisContainerBounds.height(),
        ...panel.style
      });
      bgRect.name = AXIS_ELEMENT_NAME.background;
      bgRect.id = this._getNodeId('background');

      if (!isEmpty(panel.state)) {
        bgRect.states = merge({}, DEFAULT_STATES, panel.state);
      }
      axisContainer.insertBefore(bgRect, axisContainer.firstChild);
    }
  }

  protected renderTicks(container: IGroup) {
    const tickLineItems = this.getTickLineItems();

    const tickLineGroup = createGroup({ x: 0, y: 0, pickable: false });
    tickLineGroup.name = AXIS_ELEMENT_NAME.tickContainer;
    tickLineGroup.id = this._getNodeId('tick-container');
    container.add(tickLineGroup);

    const tickLineState = isEmpty(this.attribute.tick?.state)
      ? null
      : merge({}, DEFAULT_STATES, this.attribute.tick.state);
    tickLineItems.forEach((item: TickLineItem, index) => {
      const line = createLine({
        ...this._getTickLineAttribute('tick', item, index, tickLineItems)
      });
      line.name = AXIS_ELEMENT_NAME.tick;
      line.id = this._getNodeId(item.id);
      line.states = tickLineState;
      tickLineGroup.add(line);
    });
    this.tickLineItems = tickLineItems;

    // subTick 处理
    const { subTick } = this.attribute;
    if (subTick?.visible) {
      const subTickLineItems: TickLineItem[] = this.getSubTickLineItems();
      if (subTickLineItems.length) {
        const subTickLineState = isEmpty(subTick.state) ? null : merge({}, DEFAULT_STATES, subTick.state);
        subTickLineItems.forEach((item: TickLineItem, index) => {
          const line = createLine({
            ...this._getTickLineAttribute('subTick', item, index, tickLineItems)
          });
          line.name = AXIS_ELEMENT_NAME.subTick;
          line.id = this._getNodeId(`${index}`);
          line.states = subTickLineState;
          tickLineGroup.add(line);
        });
      }

      this.subTickLineItems = subTickLineItems;
    }
  }

  protected renderLabels(container: IGroup, items: AxisItem[], layer: number) {
    let data: TransformedAxisItem[];
    if (layer === 0) {
      data = this.data;
    } else {
      data = this._transformItems(items);
    }
    const labelGroup = createGroup({ x: 0, y: 0, pickable: false });
    labelGroup.name = `${AXIS_ELEMENT_NAME.labelContainer}-layer-${layer}`;
    labelGroup.id = this._getNodeId(`label-container-layer-${layer}`);
    container.add(labelGroup);
    let maxTextWidth = 0;
    let maxTextHeight = 0;
    let textAlign = 'center';
    let textBaseline = 'middle';
    const labelState = isEmpty(this.attribute.label?.state)
      ? null
      : merge({}, DEFAULT_STATES, this.attribute.label.state);
    data.forEach((item: TransformedAxisItem, index: number) => {
      const labelStyle = this._getLabelAttribute(item, index, data, layer);
      const text = createText(labelStyle);
      text.name = AXIS_ELEMENT_NAME.label;
      text.id = this._getNodeId(`layer${layer}-label-${item.id}`);
      text.states = labelState;

      labelGroup.add(text);
      const angle = labelStyle.angle ?? 0;
      maxTextWidth = Math.max(maxTextWidth, text.AABBBounds.width());
      maxTextHeight = Math.max(maxTextHeight, text.AABBBounds.height());
      if (angle) {
        maxTextWidth = Math.abs(maxTextWidth * Math.cos(angle));
        maxTextHeight = Math.abs(maxTextHeight * Math.sin(angle));
      }
      textAlign = labelStyle.textAlign as string;
      textBaseline = labelStyle.textBaseline as string;
    });
    this.axisLabelLayerSize[layer] = {
      width: maxTextWidth,
      height: maxTextHeight,
      textAlign,
      textBaseline
    };
    return labelGroup;
    // TODO: autoOverlap
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

  protected renderGrid(container: IGroup): void {
    // 渲染 subGrid
    const { visible } = this.attribute.subGrid || {};
    if (visible) {
      this._renderGridByType('subGrid', container);
    }

    // 渲染 Grid，Grid 需要在 subGrid 上层渲染
    this._renderGridByType('grid', container);
  }

  protected getVerticalCoord(point: Point, offset: number, inside: boolean): Point {
    const vector = this.getVerticalVector(offset, inside, point);
    return {
      x: point.x + vector[0],
      y: point.y + vector[1]
    };
  }

  protected getTextAlign(vector: number[]): TextAlignType {
    let align: TextAlignType = 'center';
    if (isNumberClose(vector[0], 0)) {
      align = 'center';
    } else if (vector[0] > 0) {
      align = 'start';
    } else if (vector[0] < 0) {
      align = 'end';
    }
    return align;
  }

  protected getTickLineItems() {
    const { tick } = this.attribute;
    const data = this.data;
    // tick 处理
    const tickLineItems: TickLineItem[] = [];
    const { alignWithLabel, inside = false, length } = tick as TickAttributes;
    let tickSegment = 1;
    const count = data.length;
    if (count >= 2) {
      tickSegment = data[1].value - data[0].value;
    }
    data.forEach((item: TransformedAxisItem) => {
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
    const {
      space = 4,
      inside = false,
      formatMethod,
      // layouts = [],
      ...tagAttributes
    } = this.attribute.label as LabelAttributes;
    let offset = space;
    let tickLength = 0;
    if (this.attribute.tick?.visible && this.attribute.tick?.inside === inside) {
      tickLength = this.attribute.tick?.length || 4;
    }
    if (this.attribute.subTick?.visible && this.attribute.subTick?.inside === inside) {
      tickLength = Math.max(tickLength, this.attribute.subTick?.length || 2);
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
    const vector = this.getVerticalVector(offset, inside, point);
    const text = formatMethod ? formatMethod(tickDatum.label, tickDatum, index, tickData, layer) : tickDatum.label;
    let { style: textStyle } = tagAttributes;
    textStyle = isFunction(textStyle)
      ? merge({}, DEFAULT_AXIS_THEME.label.style, textStyle(tickDatum, index, tickData, layer))
      : textStyle;
    textStyle = merge(
      {
        textAlign: this.getTextAlign(vector),
        textBaseline: this.getTextBaseline(vector, inside)
      },
      textStyle
    ) as Partial<ITextGraphicAttribute>;
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
      ...point,
      text,
      lineHeight: textStyle?.fontSize,
      ...textStyle
    };
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

  private _renderGridByType(type: string, container: IGroup) {
    const gridAttrs = this.getGridAttribute(type);

    const gridGroup = new Grid({
      // 默认关闭
      pickable: false,
      ...gridAttrs,
      zIndex: 0
    });
    gridGroup.name = type === 'subGrid' ? `${AXIS_ELEMENT_NAME.grid}-sub` : `${AXIS_ELEMENT_NAME.grid}`;
    gridGroup.id = this._getNodeId(type);
    container.add(gridGroup as unknown as INode);
  }
}
