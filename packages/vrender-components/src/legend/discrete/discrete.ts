/**
 * @description 离散图例
 * @author 章伟星
 */
import {
  merge,
  isEmpty,
  normalizePadding,
  get,
  isValid,
  isNil,
  isFunction,
  isArray,
  minInArray,
  throttle,
  isNumberClose,
  clamp,
  isObject
} from '@visactor/vutils';
import type {
  FederatedPointerEvent,
  IGroup,
  IGraphic,
  INode,
  IGroupGraphicAttribute,
  ISymbolGraphicAttribute,
  ITextGraphicAttribute,
  CustomEvent,
  IText,
  IRichText,
  FederatedWheelEvent,
  ILinearGradient,
  IRect
} from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { graphicCreator } from '@visactor/vrender-core';
import { LegendBase } from '../base';
import { Pager } from '../../pager';
import {
  DEFAULT_TITLE_SPACE,
  DEFAULT_ITEM_SPACE_COL,
  DEFAULT_ITEM_SPACE_ROW,
  DEFAULT_SHAPE_SPACE,
  DEFAULT_SHAPE_SIZE,
  DEFAULT_LABEL_SPACE,
  DEFAULT_PAGER_SPACE,
  LegendStateValue,
  DEFAULT_VALUE_SPACE,
  LegendEvent,
  LEGEND_ELEMENT_NAME
} from '../constant';
import type {
  DiscreteLegendAttrs,
  LegendItem,
  LegendItemDatum,
  LegendPagerAttributes,
  LegendScrollbarAttributes
} from './type';
import type { ComponentOptions } from '../../interface';
import { loadDiscreteLegendComponent } from '../register';
import { createTextGraphicByType } from '../../util';
import type { ScrollBarAttributes } from '../../scrollbar';
import { ScrollBar } from '../../scrollbar';

const DEFAULT_STATES = {
  [LegendStateValue.focus]: {},
  [LegendStateValue.selected]: {},
  [LegendStateValue.selectedHover]: {},
  [LegendStateValue.unSelected]: {},
  [LegendStateValue.unSelectedHover]: {}
};

loadDiscreteLegendComponent();
export class DiscreteLegend extends LegendBase<DiscreteLegendAttrs> {
  name = 'discreteLegend';

  private _itemsContainer: IGroup | null = null;
  private _itemWidthByUser: number | undefined;
  private _itemHeightByUser: number | undefined = undefined;
  private _itemHeight = 0; // 存储每一个图例项的高度
  private _itemMaxWidth = 0; // 存储图例项的最大的宽度
  private _contentMaxHeight = 0; // 存储图例的最大的宽度 （去除 padding）
  private _pagerComponent: Pager | ScrollBar;
  private _lastActiveItem: IGroup;
  private _itemContext: {
    // 水平布局换行标识
    doWrap: boolean;
    // 存储每一列最大的宽度，用于垂直布局的换列
    maxWidthInCol: number;
    startX: number;
    startY: number;
    maxPages: number;
    pages: number;
    // 开始渲染的序号
    startIndex: number;
    items: LegendItemDatum[];
    isHorizontal: boolean;
    currentPage: number;
    totalPage: number;
    isScrollbar: boolean;
    clipContainer: IGroup;
  };
  private _scrollMask: IRect;
  private _scrollMaskContext: {
    startStops: ILinearGradient['stops'];
    endStops: ILinearGradient['stops'];
  };

  static defaultAttributes: Partial<DiscreteLegendAttrs> = {
    layout: 'horizontal',
    title: {
      align: 'start',
      space: DEFAULT_TITLE_SPACE,
      textStyle: {
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#2C3542'
      }
    },
    item: {
      spaceCol: DEFAULT_ITEM_SPACE_COL,
      spaceRow: DEFAULT_ITEM_SPACE_ROW,
      shape: {
        space: DEFAULT_SHAPE_SPACE,
        style: {
          size: DEFAULT_SHAPE_SIZE,
          cursor: 'pointer'
        },
        state: {
          selectedHover: {
            opacity: 0.85
          },
          unSelected: {
            opacity: 0.5
          }
        }
      },
      label: {
        space: DEFAULT_LABEL_SPACE,
        style: {
          fontSize: 12,
          fill: '#2C3542',
          cursor: 'pointer'
        },
        state: {
          selectedHover: {
            opacity: 0.85
          },
          unSelected: {
            fill: '#D8D8D8'
          }
        }
      },
      value: {
        alignRight: false,
        style: {
          fontSize: 12,
          fill: '#ccc',
          cursor: 'pointer'
        },
        state: {
          selectedHover: {
            opacity: 0.85
          },
          unSelected: {
            fill: '#D8D8D8'
          }
        }
      },
      background: {
        style: {
          cursor: 'pointer'
        }
      },
      focus: false,
      focusIconStyle: {
        size: DEFAULT_SHAPE_SIZE,
        symbolType:
          'M8 1C11.866 1 15 4.13401 15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1ZM8.75044 2.55077L8.75 3.75H7.25L7.25006 2.5507C4.81247 2.88304 2.88304 4.81247 2.5507 7.25006L3.75 7.25V8.75L2.55077 8.75044C2.8833 11.1878 4.81264 13.117 7.25006 13.4493L7.25 12.25H8.75L8.75044 13.4492C11.1876 13.1167 13.1167 11.1876 13.4492 8.75044L12.25 8.75V7.25L13.4493 7.25006C13.117 4.81264 11.1878 2.8833 8.75044 2.55077ZM8 5.5C9.38071 5.5 10.5 6.61929 10.5 8C10.5 9.38071 9.38071 10.5 8 10.5C6.61929 10.5 5.5 9.38071 5.5 8C5.5 6.61929 6.61929 5.5 8 5.5ZM8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7Z',
        fill: '#333',
        cursor: 'pointer'
      }
    },
    autoPage: true,
    pager: {
      space: DEFAULT_PAGER_SPACE,
      handler: {
        style: { size: 10 },
        space: 4
      }
    },
    hover: true,
    select: true,
    selectMode: 'multiple',
    allowAllCanceled: true
  };

  constructor(attributes: DiscreteLegendAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, DiscreteLegend.defaultAttributes, attributes));
  }

  render() {
    super.render();
    this._lastActiveItem = null;
  }

  /**
   * 更新选中数据
   * @param value 选中数据范围
   * @returns
   */
  setSelected(selectedData: (string | number)[]) {
    (this._itemsContainer?.getChildren() as IGroup[]).forEach(item => {
      // @ts-ignore
      const itemData = item.data as LegendItemDatum;
      if (selectedData.includes(itemData.label)) {
        this._setLegendItemState(item, LegendStateValue.selected);
        this._removeLegendItemState(item, [LegendStateValue.unSelected, LegendStateValue.unSelectedHover]);
      } else {
        // 如果当前为选中状态，则取消选中
        this._removeLegendItemState(item, [LegendStateValue.selected, LegendStateValue.selectedHover]);
        this._setLegendItemState(item, LegendStateValue.unSelected);
      }
    });
  }

  protected _renderItems() {
    const {
      item: itemAttrs = {},
      maxCol = 1,
      maxRow = 2,
      maxWidth,
      defaultSelected,
      lazyload,
      autoPage
    } = this.attribute as DiscreteLegendAttrs;
    const {
      spaceCol = DEFAULT_ITEM_SPACE_COL,
      spaceRow = DEFAULT_ITEM_SPACE_ROW,
      verticalAlign = 'middle'
    } = itemAttrs;

    const itemsContainer = this._itemsContainer;
    const { items: legendItems, isHorizontal, startIndex, isScrollbar } = this._itemContext;
    const maxPages = isScrollbar ? 1 : isHorizontal ? maxRow : maxCol;
    const maxHeight = this._contentMaxHeight;

    let { doWrap, maxWidthInCol, startX, startY, pages } = this._itemContext;
    let item: LegendItemDatum;
    let lastItemWidth = 0;

    let lastLineHeight = 0;
    const lastLineItemGroup: IGroup[] = [];
    for (let index = startIndex, len = legendItems.length; index < len; index++) {
      if (lazyload && pages > this._itemContext.currentPage * maxPages) {
        break;
      }

      if (lazyload) {
        this._itemContext.startIndex = index + 1;
      }
      item = legendItems[index];

      if (!item.id) {
        item.id = item.label; // 如果没有设置 id，默认使用 label
      }
      item.index = index; // 用于维护图例的顺序

      let isSelected = true;
      if (isArray(defaultSelected)) {
        isSelected = defaultSelected.includes(item.label);
      }

      const itemGroup = this._renderEachItem(item, isSelected, index, legendItems);

      const itemWidth = itemGroup.attribute.width;
      const itemHeight = itemGroup.attribute.height;
      this._itemHeight = Math.max(this._itemHeight, itemHeight);
      maxWidthInCol = Math.max(itemWidth, maxWidthInCol);
      this._itemMaxWidth = Math.max(itemWidth, this._itemMaxWidth);

      if (isHorizontal) {
        // 水平布局
        if (isValid(maxWidth)) {
          if (isScrollbar && autoPage) {
            // 不需要换行时
            pages = Math.ceil((startX + itemWidth) / maxWidth);
            doWrap = pages > 1;
          } else if (startX + itemWidth > maxWidth) {
            // 需要换行
            doWrap = true;
            // 避免第一个元素就超出最大宽度，额外换了一行，所以限制 startX > 0 ?
            if (startX > 0) {
              // 进行换行
              // 换行前，先将上一行的元素按照最大高度进行居中
              if (verticalAlign === 'middle' || verticalAlign === 'bottom') {
                // eslint-disable-next-line no-loop-func
                lastLineItemGroup.forEach(i => {
                  i.setAttributes({
                    y: i.attribute.y + (lastLineHeight - i.attribute.height) / (verticalAlign === 'middle' ? 2 : 1)
                  });
                });
              }

              pages += 1;
              startX = 0;
              // 应该增加的是上一行的高度 而不是当前元素高度
              startY += lastLineHeight + spaceRow;
              // 重置上一行的临时内容
              lastLineHeight = 0;
              lastLineItemGroup.length = 0;
            }
          }
        }
        if (startX !== 0 || startY !== 0) {
          itemGroup.setAttributes({
            x: startX,
            y: startY
          });
        }
        startX += spaceCol + itemWidth;
        // 此时记录当前行的最大高度
        lastLineHeight = Math.max(lastLineHeight, itemHeight);
        lastLineItemGroup.push(itemGroup);
      } else {
        // 垂直布局
        if (isValid(maxHeight)) {
          if (isScrollbar && autoPage) {
            pages = Math.ceil((startY + itemHeight) / maxHeight);
            doWrap = pages > 1;
          } else if (maxHeight <= itemHeight) {
            // 如果最大高度小于图例项高度，说明只有一行，那么就按照图例项自己的宽度进行布局即可，不需要每列同宽
            pages += 1;
            doWrap = true;
            startY = 0;
            if (index > 0) {
              startX += lastItemWidth + spaceCol;
            }
          } else if (maxHeight < startY + itemHeight) {
            // 检测是否换列：如果用户声明了 maxHeight 并且超出了，则进行换列
            pages += 1;
            doWrap = true;
            startY = 0;
            startX += maxWidthInCol + spaceCol;
            maxWidthInCol = 0;
          }
        }
        if (startX !== 0 || startY !== 0) {
          itemGroup.setAttributes({
            x: startX,
            y: startY
          });
        }
        startY += spaceRow + itemHeight;
      }

      itemsContainer.add(itemGroup);
      lastItemWidth = itemWidth;
    }

    if (isHorizontal && (verticalAlign === 'middle' || verticalAlign === 'bottom')) {
      // 水平布局 最后一行居中
      lastLineItemGroup.forEach(i => {
        i.setAttributes({
          y: i.attribute.y + (lastLineHeight - i.attribute.height) / (verticalAlign === 'middle' ? 2 : 1)
        });
      });
    }

    this._itemContext.doWrap = doWrap;
    this._itemContext.startX = startX;
    this._itemContext.startY = startY;
    this._itemContext.maxWidthInCol = maxWidthInCol;
    this._itemContext.pages = pages;
    this._itemContext.maxPages = maxPages;

    if (isScrollbar) {
      this._itemContext.totalPage = pages;
    }

    if (!lazyload) {
      this._itemContext.startIndex = legendItems.length;
    }

    return this._itemContext;
  }

  protected _renderContent() {
    const { item = {}, items, reversed, maxWidth, maxHeight } = this.attribute as DiscreteLegendAttrs;
    if (item.visible === false || isEmpty(items)) {
      return;
    }

    let legendItems = items;
    if (reversed) {
      legendItems = items?.reverse();
    }

    this._contentMaxHeight = Math.max(0, maxHeight - this._parsedPadding[0] - this._parsedPadding[2]);

    const itemsContainer = graphicCreator.group({
      x: 0,
      y: 0
    });
    this._itemsContainer = itemsContainer;

    const { layout, autoPage } = this.attribute;
    const isHorizontal = layout === 'horizontal';

    const { maxWidth: maxItemWidth, width: itemWidth, height: itemHeight } = item;

    const widthsOptions = [];
    // 根据用户声明的 maxItemWidth 和 itemWidth 获取图例项宽度
    if (isValid(maxItemWidth)) {
      widthsOptions.push(maxItemWidth);
    }
    if (isValid(itemWidth)) {
      widthsOptions.push(itemWidth);
    }

    if (widthsOptions.length) {
      if (isValid(maxWidth)) {
        widthsOptions.push(maxWidth);
      }
      this._itemWidthByUser = minInArray(widthsOptions);
    }
    // 存储用户指定图例项高度
    if (isValid(itemHeight)) {
      this._itemHeightByUser = itemHeight;
    }
    const pager = this.attribute.pager;
    this._itemContext = {
      currentPage: pager ? pager.defaultCurrent || 1 : 1,
      doWrap: false,
      maxWidthInCol: 0,
      maxPages: 1,
      pages: 1,
      startX: 0,
      startY: 0,
      startIndex: 0,
      items: legendItems,
      isHorizontal,
      totalPage: Infinity,
      isScrollbar: pager && (pager as LegendScrollbarAttributes).type === 'scrollbar',
      clipContainer: undefined
    };

    this._itemContext = this._renderItems();
    // TODO: 添加测试用例
    let pagerRendered = false;
    if (this._itemContext.doWrap && autoPage && this._itemContext.pages > this._itemContext.maxPages) {
      // 进行分页处理
      pagerRendered = this._renderPagerComponent();
    }

    if (!pagerRendered) {
      itemsContainer.setAttribute(
        'y',
        this._title ? this._title.AABBBounds.height() + get(this.attribute, 'title.space', 8) : 0
      );
      this._innerView.add(itemsContainer);
    }
  }

  protected _bindEvents() {
    if (this.attribute.disableTriggerEvent) {
      return;
    }
    if (!this._itemsContainer) {
      return;
    }

    const { hover = true, select = true } = this.attribute;

    if (hover) {
      let trigger = 'pointermove';
      let triggerOff = 'pointerleave';

      if (isObject(hover)) {
        hover.trigger && (trigger = hover.trigger);
        hover.triggerOff && (triggerOff = hover.triggerOff);
      }

      this._itemsContainer.addEventListener(trigger, this._onHover as EventListenerOrEventListenerObject);
      this._itemsContainer.addEventListener(triggerOff, this._onUnHover as EventListenerOrEventListenerObject);
    }

    if (select) {
      let trigger = 'pointerdown';
      if (isObject(select) && select.trigger) {
        trigger = select.trigger;
      }
      this._itemsContainer.addEventListener(trigger, this._onClick as EventListenerOrEventListenerObject);
    }
  }

  private _autoEllipsis(
    autoEllipsisStrategy: 'labelFirst' | 'valueFirst' | 'none',
    layoutWidth: number,
    labelShape: IText | IRichText,
    valueShape: IText | IRichText
  ) {
    const { label: labelAttr, value: valueAttr } = this.attribute.item as LegendItem;
    const valueBounds = valueShape.AABBBounds;
    const labelBounds = labelShape.AABBBounds;
    const valueWidth = valueBounds.width();
    const labelWidth = labelBounds.width();
    let useWidthRatio = false;

    if (autoEllipsisStrategy === 'labelFirst') {
      if (labelWidth > layoutWidth) {
        useWidthRatio = true;
      } else {
        valueShape.setAttribute('maxLineWidth', layoutWidth - labelWidth);
      }
    } else if (autoEllipsisStrategy === 'valueFirst') {
      if (valueWidth > layoutWidth) {
        useWidthRatio = true;
      } else {
        labelShape.setAttribute('maxLineWidth', layoutWidth - valueWidth);
      }
    } else if (valueWidth + labelWidth > layoutWidth) {
      useWidthRatio = true;
    }

    if (useWidthRatio) {
      valueShape.setAttribute(
        'maxLineWidth',
        Math.max(layoutWidth * (labelAttr.widthRatio ?? 0.5), layoutWidth - labelWidth)
      );
      labelShape.setAttribute(
        'maxLineWidth',
        Math.max(layoutWidth * (valueAttr.widthRatio ?? 0.5), layoutWidth - valueWidth)
      );
    }
  }

  private _renderEachItem(item: LegendItemDatum, isSelected: boolean, index: number, items: LegendItemDatum[]) {
    const { id, label, value, shape } = item;
    const { padding = 0, focus, focusIconStyle, align, autoEllipsisStrategy } = this.attribute.item as LegendItem;

    const { shape: shapeAttr, label: labelAttr, value: valueAttr, background } = this.attribute.item as LegendItem;

    const shapeStyle = this._handleStyle(shapeAttr, item, isSelected, index, items);
    const labelStyle = this._handleStyle(labelAttr, item, isSelected, index, items);
    const valueStyle = this._handleStyle(valueAttr, item, isSelected, index, items);
    const backgroundStyle = this._handleStyle(background, item, isSelected, index, items);

    const parsedPadding = normalizePadding(padding);

    let itemGroup;
    if (background.visible === false) {
      itemGroup = graphicCreator.group({
        x: 0,
        y: 0,
        cursor: (backgroundStyle.style as IGroupGraphicAttribute)?.cursor
      });
      this._appendDataToShape(itemGroup, LEGEND_ELEMENT_NAME.item, item, itemGroup);
    } else {
      itemGroup = graphicCreator.group({
        x: 0,
        y: 0,
        ...backgroundStyle.style
      });
      this._appendDataToShape(itemGroup, LEGEND_ELEMENT_NAME.item, item, itemGroup, backgroundStyle.state);
    }
    itemGroup.id = `${id ?? label}-${index}`;

    itemGroup.addState(isSelected ? LegendStateValue.selected : LegendStateValue.unSelected);

    const innerGroup = graphicCreator.group({
      x: 0,
      y: 0,
      pickable: false
    });
    itemGroup.add(innerGroup);

    let focusStartX = 0;
    let shapeSize = 0;
    let shapeSpace = 0;
    if (shapeAttr && shapeAttr.visible !== false) {
      const s = get(shapeStyle, 'style.size', DEFAULT_SHAPE_SIZE);
      if (isArray(s)) {
        shapeSize = s[0] || 0;
      } else {
        shapeSize = s;
      }
      shapeSpace = get(shapeAttr, 'space', DEFAULT_SHAPE_SPACE);
      const itemShape = graphicCreator.symbol({
        x: 0,
        y: 0,
        symbolType: 'circle',
        strokeBoundsBuffer: 0,
        ...shape,
        ...shapeStyle.style
      });
      // 处理下 shape 的 fill stroke
      Object.keys(shapeStyle.state || {}).forEach(key => {
        const color =
          (shapeStyle.state[key] as ISymbolGraphicAttribute).fill ||
          (shapeStyle.state[key] as ISymbolGraphicAttribute).stroke;
        if (shape.fill && isNil((shapeStyle.state[key] as ISymbolGraphicAttribute).fill) && color) {
          (shapeStyle.state[key] as ISymbolGraphicAttribute).fill = color as string;
        }

        if (shape.stroke && isNil((shapeStyle.state[key] as ISymbolGraphicAttribute).stroke) && color) {
          (shapeStyle.state[key] as ISymbolGraphicAttribute).stroke = color as string;
        }
      });
      this._appendDataToShape(itemShape, LEGEND_ELEMENT_NAME.itemShape, item, itemGroup, shapeStyle.state);

      itemShape.addState(isSelected ? LegendStateValue.selected : LegendStateValue.unSelected);
      innerGroup.add(itemShape);
    }

    let focusShape: IGraphic;
    let focusSpace = 0;
    if (focus) {
      const focusSize = get(focusIconStyle, 'size', DEFAULT_SHAPE_SIZE);
      // 绘制聚焦按钮
      focusShape = graphicCreator.symbol({
        x: 0,
        y: -focusSize / 2 - 1,
        strokeBoundsBuffer: 0,
        boundsPadding: parsedPadding,
        ...focusIconStyle,
        visible: true,
        pickMode: 'imprecise'
      });
      this._appendDataToShape(focusShape, LEGEND_ELEMENT_NAME.focus, item, itemGroup);

      focusSpace = focusSize;
    }
    const text = labelAttr.formatMethod ? labelAttr.formatMethod(label, item, index) : label;
    const labelAttributes = {
      x: shapeSize / 2 + shapeSpace,
      y: 0,
      textAlign: 'start',
      textBaseline: 'middle',
      lineHeight: (labelStyle.style as ITextGraphicAttribute)?.fontSize,
      ...labelStyle.style,
      text,
      _originText: labelAttr.formatMethod ? label : undefined
    };

    const labelShape = createTextGraphicByType(labelAttributes);

    this._appendDataToShape(labelShape, LEGEND_ELEMENT_NAME.itemLabel, item, itemGroup, labelStyle.state);
    labelShape.addState(isSelected ? LegendStateValue.selected : LegendStateValue.unSelected);
    innerGroup.add(labelShape);
    const labelSpace = get(labelAttr, 'space', DEFAULT_LABEL_SPACE);
    if (isValid(value)) {
      const valueSpace = get(valueAttr, 'space', focus ? DEFAULT_VALUE_SPACE : 0);
      const valueText = valueAttr.formatMethod ? valueAttr.formatMethod(value, item, index) : value;
      const valueAttributes = {
        x: 0,
        y: 0,
        textAlign: 'start',
        textBaseline: 'middle',
        lineHeight: (valueStyle.style as ITextGraphicAttribute).fontSize,
        ...valueStyle.style,
        text: valueText,
        _originText: valueAttr.formatMethod ? value : undefined
      };

      const valueShape = createTextGraphicByType(valueAttributes);

      this._appendDataToShape(valueShape, LEGEND_ELEMENT_NAME.itemValue, item, itemGroup, valueStyle.state);
      valueShape.addState(isSelected ? LegendStateValue.selected : LegendStateValue.unSelected);

      if (this._itemWidthByUser) {
        // 计算用来防止文本的宽度
        const layoutWidth =
          this._itemWidthByUser -
          parsedPadding[1] -
          parsedPadding[3] -
          shapeSize -
          shapeSpace -
          labelSpace -
          focusSpace -
          valueSpace;

        this._autoEllipsis(autoEllipsisStrategy, layoutWidth, labelShape, valueShape);

        if (valueAttr.alignRight) {
          valueShape.setAttributes({
            // @ts-ignore
            textAlign: 'right',
            x: this._itemWidthByUser - shapeSize / 2 - parsedPadding[1] - parsedPadding[3] - focusSpace - valueSpace
          });
        } else {
          valueShape.setAttribute('x', labelSpace + (labelShape.AABBBounds.empty() ? 0 : labelShape.AABBBounds.x2));
        }
      } else {
        valueShape.setAttribute('x', labelSpace + (labelShape.AABBBounds.empty() ? 0 : labelShape.AABBBounds.x2));
      }
      focusStartX = valueSpace + (valueShape.AABBBounds.empty() ? 0 : valueShape.AABBBounds.x2);

      innerGroup.add(valueShape);
    } else if (this._itemWidthByUser) {
      labelShape.setAttribute(
        'maxLineWidth',
        this._itemWidthByUser - parsedPadding[1] - parsedPadding[3] - shapeSize - shapeSpace - focusSpace
      );

      focusStartX = labelSpace + (labelShape.AABBBounds.empty() ? 0 : labelShape.AABBBounds.x2);
    } else {
      focusStartX = labelSpace + (labelShape.AABBBounds.empty() ? 0 : labelShape.AABBBounds.x2);
    }

    if (focusShape) {
      focusShape.setAttribute('x', focusStartX);
      innerGroup.add(focusShape);
    }

    const innerGroupBounds = innerGroup.AABBBounds;
    const innerGroupWidth = innerGroupBounds.width();

    if (align === 'right') {
      const x2 = innerGroupBounds.x2;
      const x1 = innerGroupBounds.x1;
      innerGroup.forEachChildren((child: IGraphic, index: number) => {
        if (
          (child.type !== 'symbol' && (child as IText).attribute.textAlign !== 'right') ||
          child === (focusShape as unknown as IGraphic)
        ) {
          child.setAttribute('x', x1 + x2 - child.attribute.x - child.AABBBounds.width());
        } else if (child.type !== 'symbol') {
          (child as IText).setAttributes({ x: x1 + x2 - child.attribute.x, textAlign: 'left' });
        } else {
          child.setAttribute('x', x1 + x2 - child.attribute.x);
        }
      });
    }

    const innerGroupHeight = innerGroupBounds.height();
    const itemGroupWidth = isValid(this.attribute.item.width)
      ? this.attribute.item.width
      : innerGroupWidth + parsedPadding[1] + parsedPadding[3];
    const itemGroupHeight = this._itemHeightByUser || innerGroupHeight + parsedPadding[0] + parsedPadding[2];
    itemGroup.attribute.width = itemGroupWidth;
    itemGroup.attribute.height = itemGroupHeight;
    focusShape && focusShape.setAttribute('visible', false);

    innerGroup.translateTo(-innerGroupBounds.x1 + parsedPadding[3], -innerGroupBounds.y1 + parsedPadding[0]);
    return itemGroup;
  }

  private _createPager(compStyle: LegendPagerAttributes | LegendScrollbarAttributes) {
    const { disableTriggerEvent, maxRow } = this.attribute;
    const estimateTotal = (num: number) => {
      if (num <= 99) {
        return 99;
      } else if (num <= 999) {
        return 999;
      }
      return 9999;
    };
    return this._itemContext.isHorizontal
      ? new Pager({
          layout: maxRow === 1 ? 'horizontal' : 'vertical',
          total: estimateTotal(this._itemContext.pages),
          ...merge(
            {
              handler: {
                preShape: 'triangleUp',
                nextShape: 'triangleDown'
              }
            },
            compStyle as LegendPagerAttributes
          ),
          defaultCurrent: this.attribute.pager?.defaultCurrent,
          disableTriggerEvent
        })
      : new Pager({
          layout: 'horizontal',
          total: estimateTotal(this._itemContext.pages), // 用于估算,
          disableTriggerEvent,
          defaultCurrent: this.attribute.pager?.defaultCurrent,
          ...(compStyle as LegendPagerAttributes)
        });
  }

  private _createScrollbar(compStyle: LegendPagerAttributes | LegendScrollbarAttributes, compSize: number) {
    const { disableTriggerEvent } = this.attribute;

    return this._itemContext.isHorizontal
      ? new ScrollBar({
          direction: 'horizontal',
          disableTriggerEvent,
          range: [0, 0.5],
          height: compStyle.visible === false ? 0 : 12,
          ...(compStyle as LegendScrollbarAttributes),
          width: compSize
        })
      : new ScrollBar({
          direction: 'vertical',
          width: compStyle.visible === false ? 0 : 12,
          range: [0, 0.5],
          ...(compStyle as LegendScrollbarAttributes),
          height: compSize,
          disableTriggerEvent
        });
  }

  private _updatePositionOfPager(renderStartY: number, compWidth: number, compHeight: number) {
    const { pager } = this.attribute;
    const { totalPage, isHorizontal } = this._itemContext;
    const position = (pager && (pager as LegendPagerAttributes).position) || 'middle';
    (this._pagerComponent as Pager).setTotal(totalPage);

    if (isHorizontal) {
      let y;
      if (position === 'start') {
        y = renderStartY;
      } else if (position === 'end') {
        y = renderStartY + compHeight - this._pagerComponent.AABBBounds.height() / 2;
      } else {
        y = renderStartY + compHeight / 2 - this._pagerComponent.AABBBounds.height() / 2;
      }
      this._pagerComponent.setAttributes({
        x: compWidth - this._pagerComponent.AABBBounds.width(),
        y
      });
    } else {
      let x;
      if (position === 'start') {
        x = 0;
      } else if (position === 'end') {
        x = compWidth - this._pagerComponent.AABBBounds.width();
      } else {
        x = (compWidth - this._pagerComponent.AABBBounds.width()) / 2;
      }
      this._pagerComponent.setAttributes({
        x,
        y: compHeight - this._pagerComponent.AABBBounds.height()
      });
    }
  }

  private _computeScrollbarDelta() {
    const { isHorizontal, clipContainer } = this._itemContext;
    const itemContainerBounds = this._itemsContainer.AABBBounds;
    const clipContainerBounds = clipContainer.AABBBounds;

    let delta;
    let innerViewSize;

    if (isHorizontal) {
      innerViewSize = clipContainerBounds.width();
      delta = innerViewSize / itemContainerBounds.width();
    } else {
      innerViewSize = clipContainerBounds.height();
      delta = innerViewSize / itemContainerBounds.height();
    }
    return delta;
  }

  private _updatePositionOfScrollbar(contentWidth: number, contentHeight: number, renderStartY: number) {
    const { isHorizontal, currentPage, totalPage } = this._itemContext;

    const start = (currentPage - 1) / totalPage;

    (this._pagerComponent as ScrollBar).setScrollRange([start, start + this._computeScrollbarDelta()]);

    if (isHorizontal) {
      (this._pagerComponent as ScrollBar).setAttributes({
        x: 0,
        y: renderStartY + contentHeight
      });
    } else {
      (this._pagerComponent as ScrollBar).setAttributes({
        x: contentWidth,
        y: renderStartY
      });
    }
  }

  private _bindEventsOfPager(pageSize: number, channel: 'x' | 'y') {
    const pager = this.attribute.pager || {};
    const { animation = true, animationDuration = 450, animationEasing = 'quadIn' } = pager;
    const pageParser = this._itemContext.isScrollbar
      ? (e: CustomEvent) => {
          const { value } = e.detail;
          let newPage;
          // page 信息不再用于 scroll 窗口的位置更新
          // scrollbar 模式，记录 newPage 用于开启 lazyLoad 的场景
          if (value[0] === 0) {
            newPage = 1;
          } else if (value[1] === 1) {
            newPage = this._itemContext.totalPage;
          } else {
            newPage = value[0] * this._itemContext.totalPage + 1;
          }

          return newPage;
        }
      : (e: CustomEvent) => {
          return e.detail.current;
        };

    const onScroll = (e: FederatedWheelEvent) => {
      const scrollComponent = this._pagerComponent as ScrollBar;
      const preScrollRange = scrollComponent.getScrollRange();
      const { direction } = scrollComponent.attribute as ScrollBarAttributes;
      const { width, height } = scrollComponent.getSliderRenderBounds();
      const currentScrollValue = direction === 'vertical' ? e.deltaY / height : e.deltaX / width;
      scrollComponent.setScrollRange(
        [preScrollRange[0] + currentScrollValue, preScrollRange[1] + currentScrollValue],
        true
      );

      this.updateScrollMask();
    };

    const onPaging = (e: CustomEvent) => {
      const newPage = pageParser(e);

      if (newPage === this._itemContext.currentPage) {
        return;
      }

      this._itemContext.currentPage = newPage;

      if (this._itemContext && this._itemContext.startIndex < this._itemContext.items.length) {
        this._renderItems();

        const newTotalPage = Math.ceil(this._itemContext.pages / this._itemContext.maxPages);
        // 更新总页数
        this._itemContext.totalPage = newTotalPage;
        // 更新 scrollbar 的范围
        if (this._itemContext.isScrollbar && this._pagerComponent) {
          const newDelta = this._computeScrollbarDelta();
          const [start] = (this._pagerComponent as ScrollBar).getScrollRange();
          (this._pagerComponent as ScrollBar).setScrollRange([start, start + newDelta]);
        }
      }

      if (!this._itemContext.isScrollbar) {
        if (animation) {
          (this._itemsContainer as IGroup)
            .animate()
            .to({ [channel]: -(newPage - 1) * pageSize }, animationDuration, animationEasing);
        } else {
          (this._itemsContainer as IGroup).setAttribute(channel, -(newPage - 1) * pageSize);
        }
      } else {
        const [start] = (this._pagerComponent as ScrollBar).getScrollRange();
        let containerSize;
        if (this._itemContext.isHorizontal) {
          containerSize = this._itemsContainer.AABBBounds.width();
        } else {
          containerSize = this._itemsContainer.AABBBounds.height();
        }

        const startOffset = containerSize * start;
        this.updateScrollMask();

        if (animation) {
          this._itemsContainer.animate().to({ [channel]: -startOffset }, animationDuration, animationEasing);
        } else {
          this._itemsContainer.setAttribute(channel, -startOffset);
        }
      }
    };
    if (this._itemContext.isScrollbar) {
      this._pagerComponent.addEventListener('scrollDrag', onPaging);
      this._pagerComponent.addEventListener('scrollUp', onPaging);
      if (((this.attribute as DiscreteLegendAttrs).pager as LegendScrollbarAttributes).roamScroll) {
        const THROTTLE_TIME = 50;
        // preventDefault不能和throttle一起使用, 否则阻止默认事件失败
        this.addEventListener('wheel', (e: FederatedWheelEvent) => e.nativeEvent.preventDefault());
        this.addEventListener('wheel', throttle(onScroll, THROTTLE_TIME));
      }
    } else {
      this._pagerComponent.addEventListener('toPrev', onPaging);
      this._pagerComponent.addEventListener('toNext', onPaging);
    }
  }

  private _renderPager() {
    const renderStartY = this._title ? this._title.AABBBounds.height() + get(this.attribute, 'title.space', 8) : 0;
    const { maxWidth, maxCol = 1, maxRow = 2, item = {}, pager = {} } = this.attribute;
    const { spaceCol = DEFAULT_ITEM_SPACE_COL, spaceRow = DEFAULT_ITEM_SPACE_ROW } = item;
    const itemsContainer = this._itemsContainer as IGroup;
    const { space: pagerSpace = DEFAULT_PAGER_SPACE, defaultCurrent = 1, ...compStyle } = pager;
    const { isHorizontal } = this._itemContext;
    const maxHeight = this._contentMaxHeight;

    let comp: ScrollBar | Pager;
    let compWidth = 0;
    let compHeight = 0;
    let contentWidth = 0;
    let contentHeight = 0;
    let startX = 0; // 临时变量，用来存储布局的起始点
    let startY = 0; // 临时变量，用来存储布局的起始点
    let pages = 1; // 页数

    if (isHorizontal) {
      compHeight = (maxRow - 1) * spaceRow + this._itemHeight * maxRow;
      compWidth = maxWidth;
      // 水平布局，支持上下翻页
      comp = this._createPager(compStyle);
      this._pagerComponent = comp;
      this._innerView.add(comp as unknown as INode);
      contentWidth = (maxWidth as number) - comp.AABBBounds.width() - pagerSpace;
      if (contentWidth <= 0) {
        // 布局空间不够则不进行分页器渲染
        this._innerView.removeChild(comp as unknown as INode);
        return false;
      }

      // 重新进行布局
      (itemsContainer.getChildren() as unknown as IGroup[]).forEach((item, index) => {
        const { width, height } = item.attribute;

        if (contentWidth < startX + (width as number)) {
          // 超出了，则换行
          startX = 0;
          startY += (height as number) + spaceRow;
          pages += 1;
        }
        if (index > 0) {
          item.setAttributes({
            x: startX,
            y: startY
          });
        }
        startX += spaceCol + (width as number);
      });

      this._itemContext.startX = startX;
      this._itemContext.startY = startY;
      this._itemContext.pages = pages;
      const total = Math.ceil(pages / maxRow);

      this._itemContext.totalPage = total;

      this._updatePositionOfPager(renderStartY, compWidth, compHeight);
    } else {
      compWidth = this._itemMaxWidth * maxCol + (maxCol - 1) * spaceCol;
      compHeight = maxHeight;
      contentWidth = compWidth;

      // 垂直布局，支持左右翻页
      comp = this._createPager(compStyle);
      this._pagerComponent = comp;
      this._innerView.add(comp as unknown as INode);

      contentHeight = (maxHeight as number) - comp.AABBBounds.height() - pagerSpace - renderStartY;

      if (contentHeight <= 0) {
        // 布局空间不够则不进行分页器渲染
        this._innerView.removeChild(comp as unknown as INode);
        return false;
      }

      // 重新进行布局

      (itemsContainer.getChildren() as unknown as IGroup[]).forEach((item, index) => {
        const { height } = item.attribute;
        if (contentHeight < startY + (height as number)) {
          startY = 0;
          startX += this._itemMaxWidth + spaceCol;
          pages += 1;
        }
        if (index > 0) {
          item.setAttributes({
            x: startX,
            y: startY
          });
        }
        startY += spaceRow + (height as number);
      });

      // todo
      const total = Math.ceil(pages / maxCol);

      this._itemContext.totalPage = total;
      this._updatePositionOfPager(renderStartY, compWidth, compHeight);
    }

    // 初始化 defaultCurrent
    if (defaultCurrent > 1) {
      if (isHorizontal) {
        itemsContainer.setAttribute('y', -(defaultCurrent - 1) * (compHeight + spaceRow));
      } else {
        itemsContainer.setAttribute('x', -(defaultCurrent - 1) * (compWidth + spaceCol));
      }
    }

    const clipGroup = graphicCreator.group({
      x: 0,
      y: renderStartY,
      width: isHorizontal ? contentWidth : compWidth,
      height: isHorizontal ? compHeight : contentHeight,
      clip: true,
      pickable: false
    });
    clipGroup.add(itemsContainer);
    this._innerView.add(clipGroup);
    this._itemContext.clipContainer = clipGroup;

    this._bindEventsOfPager(isHorizontal ? compHeight + spaceRow : compWidth + spaceCol, isHorizontal ? 'y' : 'x');

    return true;
  }

  private _renderScrollbar() {
    const renderStartY = this._title ? this._title.AABBBounds.height() + get(this.attribute, 'title.space', 8) : 0;
    const { maxWidth, item = {}, pager = {} } = this.attribute;
    const { spaceCol = DEFAULT_ITEM_SPACE_COL, spaceRow = DEFAULT_ITEM_SPACE_ROW } = item;
    const itemsContainer = this._itemsContainer as IGroup;
    const { space: pagerSpace = DEFAULT_PAGER_SPACE, defaultCurrent = 1, ...compStyle } = pager;
    const { isHorizontal } = this._itemContext;
    const maxHeight = this._contentMaxHeight;

    let comp: ScrollBar | Pager;
    let contentWidth = 0;
    let contentHeight = 0;
    let startY = 0; // 临时变量，用来存储布局的起始点
    let pages = 1; // 页数

    if (isHorizontal) {
      contentWidth = maxWidth;
      contentHeight = this._itemHeight;
      // 水平布局，支持上下翻页
      comp = this._createScrollbar(compStyle, contentWidth);
      this._pagerComponent = comp;
      this._innerView.add(comp as unknown as INode);
    } else {
      contentHeight = (maxHeight as number) - renderStartY;
      contentWidth = this._itemMaxWidth;
      // 垂直布局，支持左右翻页
      comp = this._createScrollbar(compStyle, contentHeight);
      this._pagerComponent = comp;
      this._innerView.add(comp as unknown as INode);

      if (contentHeight <= 0) {
        // 布局空间不够则不进行分页器渲染
        this._innerView.removeChild(comp as unknown as INode);
        return false;
      }

      // 重新进行布局
      // 边界场景: 最后一项item的文字内容在倒数第二页, 但由于bounds比文字本身大一点, 触发分页, 导致最后一页是空白
      // 关联issue: https://github.com/VisActor/VChart/issues/3344
      // 解决方式:
      // - 所有的item 高度一致的时候: 按照 (itemHeight + space) * 倍数 布局
      // - item高度不一致的情况: 最后一项的的高度分到最后一页的高度 >= 1/3 才分页
      const items = itemsContainer.getChildren() as IGroup[];
      const itemsHeightArr = items.map((item: IGroup) => item.attribute.height);
      if (itemsHeightArr.length === 1 || itemsHeightArr.every(entry => entry === itemsHeightArr[0])) {
        const itemHeight = itemsHeightArr[0];
        const maxContentHeight = contentHeight;
        const pageItemsCount = Math.floor(maxContentHeight / (spaceRow + itemHeight));
        contentHeight = pageItemsCount * (spaceRow + itemHeight);
        pages = Math.ceil(items.length / pageItemsCount);
      } else {
        items.forEach((item, index) => {
          const { height } = item.attribute;

          const prePages = pages;
          const preStartY = startY;
          pages = Math.floor((startY + height) / contentHeight) + 1;
          startY += spaceRow + (height as number);
          if (
            prePages !== pages && // 触发分页
            index === itemsContainer.getChildren().length - 1 && //
            startY - contentHeight >= (1 / 3) * height
          ) {
            contentHeight = preStartY + height; // 保证刚好完全展示最后一项
            pages -= 1; // 不分页
          }
        });
      }

      this._itemContext.totalPage = pages;
      this._itemContext.pages = pages;
    }

    // 初始化 defaultCurrent
    if (defaultCurrent > 1) {
      if (isHorizontal) {
        const maxOffset = this._itemsContainer.AABBBounds.width() - contentWidth;
        itemsContainer.setAttribute('x', -Math.min((defaultCurrent - 1) * (contentWidth + spaceCol), maxOffset));
      } else {
        const maxOffset = this._itemsContainer.AABBBounds.height() - contentHeight;
        itemsContainer.setAttribute('y', -Math.min((defaultCurrent - 1) * (contentHeight + spaceRow), maxOffset));
      }
    }

    const clipGroup = graphicCreator.group({
      x: 0,
      y: renderStartY,
      width: contentWidth,
      height: contentHeight,
      clip: true,
      pickable: false
    });
    clipGroup.add(itemsContainer);
    this._innerView.add(clipGroup);
    this._itemContext.clipContainer = clipGroup;

    this._updatePositionOfScrollbar(contentWidth, contentHeight, renderStartY);

    if ((pager as LegendScrollbarAttributes).scrollMask?.visible) {
      this.renderScrollMask(clipGroup);
    }

    this._bindEventsOfPager(isHorizontal ? contentWidth : contentHeight, isHorizontal ? 'x' : 'y');
    return true;
  }

  private renderScrollMask(clipGroup: IGroup) {
    const { scrollMask = {} as LegendScrollbarAttributes['scrollMask'] } = this.attribute
      .pager as LegendScrollbarAttributes;
    const { visible = true, gradientLength = 16, gradientStops } = scrollMask;
    if (!visible || !gradientStops) {
      return;
    }
    const width = clipGroup.AABBBounds.width();
    const height = clipGroup.AABBBounds.height();
    const totalLength = this._itemContext.isHorizontal ? width : height;

    const startStops = gradientStops.map(stop => {
      return {
        offset: (gradientLength * stop.offset) / totalLength,
        color: stop.color
      };
    });
    const endStops = gradientStops.map(stop => {
      return {
        offset: (totalLength - gradientLength * stop.offset) / totalLength,
        color: stop.color
      };
    });

    const mask = graphicCreator.rect({
      x: 0,
      y: 0,
      width,
      height
    });
    this._scrollMask = mask;
    this._scrollMaskContext = { startStops, endStops };
    this.updateScrollMask();

    clipGroup.add(mask);
  }

  private updateScrollMask() {
    if (!this._scrollMask || !this._pagerComponent) {
      return;
    }

    if (!this._itemContext.isScrollbar) {
      return;
    }

    const [start, end] = (this._pagerComponent as ScrollBar).getScrollRange();
    const stops = [];
    if (!isNumberClose(clamp(end, 0, 1), 1)) {
      stops.push(...this._scrollMaskContext.endStops);
    }

    if (!isNumberClose(clamp(start, 0, 1), 0)) {
      stops.push(...this._scrollMaskContext.startStops);
    }

    if (stops.length) {
      if (this._itemContext.isHorizontal) {
        this._scrollMask.setAttributes({
          fill: {
            gradient: 'linear',
            x0: 0,
            y0: 0,
            x1: 1,
            y1: 0,
            stops
          }
        });
      } else {
        this._scrollMask.setAttributes({
          fill: {
            gradient: 'linear',
            x0: 0,
            y0: 0,
            x1: 0,
            y1: 1,
            stops
          }
        });
      }
    }
  }

  private _renderPagerComponent() {
    if (this._itemContext.isScrollbar) {
      this._renderScrollbar();
    } else {
      this._renderPager();
    }

    return true;
  }

  private _onHover = (e: FederatedPointerEvent) => {
    const target = e.target as unknown as IGroup;
    if (target && target.name && target.name.startsWith(LEGEND_ELEMENT_NAME.item)) {
      // @ts-ignore
      const legendItem = target.delegate;

      // 如果上个激活元素存在，则判断当前元素是否和上个激活元素相同，相同则不做处理，不相同则触发 unhover
      if (this._lastActiveItem) {
        if (this._lastActiveItem.id === legendItem.id) {
          return;
        }
        this._unHover(this._lastActiveItem, e);
      }
      this._hover(legendItem, e);
    } else if (this._lastActiveItem) {
      this._unHover(this._lastActiveItem, e);
      this._lastActiveItem = null;
    }
  };

  private _onUnHover = (e: FederatedPointerEvent) => {
    if (this._lastActiveItem) {
      this._unHover(this._lastActiveItem, e);
      this._lastActiveItem = null;
    }
  };

  private _onClick = (e: FederatedPointerEvent) => {
    const target = e.target as unknown as IGroup;
    if (target && target.name && target.name.startsWith(LEGEND_ELEMENT_NAME.item)) {
      // @ts-ignore
      const legendItem = target.delegate;
      const { selectMode = 'multiple' } = this.attribute;

      // 图例聚焦功能
      if (target.name === LEGEND_ELEMENT_NAME.focus || selectMode === 'focus') {
        const isFocusSelected = legendItem.hasState(LegendStateValue.focus);
        legendItem.toggleState(LegendStateValue.focus);

        if (isFocusSelected) {
          // 当前为选中态，则再次点击变成全选
          this._itemsContainer?.getChildren().forEach(item => {
            this._removeLegendItemState(
              item as unknown as IGroup,
              [LegendStateValue.unSelected, LegendStateValue.unSelectedHover, LegendStateValue.focus],
              e
            );
            this._setLegendItemState(item as unknown as IGroup, LegendStateValue.selected, e);
          });
        } else {
          this._setLegendItemState(legendItem, LegendStateValue.selected, e);
          this._removeLegendItemState(legendItem, [LegendStateValue.unSelected, LegendStateValue.unSelectedHover], e);
          // 单选逻辑，当前被点击的图例项设置为选中态，其他全部设置为非选中态
          this._itemsContainer?.getChildren().forEach(item => {
            if (legendItem !== item) {
              this._removeLegendItemState(
                item as unknown as IGroup,
                [LegendStateValue.selected, LegendStateValue.selectedHover, LegendStateValue.focus],
                e
              );
              this._setLegendItemState(item as unknown as IGroup, LegendStateValue.unSelected, e);
            }
          });
        }
      } else {
        // 清除 focus 状态
        this._itemsContainer?.getChildren().forEach(item => {
          (item as unknown as IGroup).removeState(LegendStateValue.focus);
        });
        const { allowAllCanceled = true } = this.attribute;
        const isSelected = legendItem.hasState(LegendStateValue.selected);
        const currentSelectedItems = this._getSelectedLegends();
        if (selectMode === 'multiple') {
          if (allowAllCanceled === false && isSelected && currentSelectedItems.length === 1) {
            this._dispatchLegendEvent(LegendEvent.legendItemClick, legendItem, e);
            return;
          }
          // 多选逻辑
          if (isSelected) {
            // 如果当前为选中状态，则取消选中
            this._removeLegendItemState(legendItem, [LegendStateValue.selected, LegendStateValue.selectedHover], e);
            this._setLegendItemState(legendItem, LegendStateValue.unSelected, e);
          } else {
            // 如果当前为非选中态，则设置为选中状态
            this._setLegendItemState(legendItem, LegendStateValue.selected, e);
            this._removeLegendItemState(legendItem, [LegendStateValue.unSelected, LegendStateValue.unSelectedHover], e);
          }
        } else {
          this._setLegendItemState(legendItem, LegendStateValue.selected, e);
          this._removeLegendItemState(legendItem, [LegendStateValue.unSelected, LegendStateValue.unSelectedHover], e);

          // 单选逻辑，当前被点击的图例项设置为选中态，其他全部设置为非选中态
          this._itemsContainer?.getChildren().forEach(item => {
            if (legendItem !== item) {
              this._removeLegendItemState(
                item as unknown as IGroup,
                [LegendStateValue.selected, LegendStateValue.selectedHover],
                e
              );
              this._setLegendItemState(item as unknown as IGroup, LegendStateValue.unSelected, e);
            }
          });
        }
      }

      this._dispatchLegendEvent(LegendEvent.legendItemClick, legendItem, e);
    }
  };

  private _hover(legendItem: IGroup, e: FederatedPointerEvent) {
    this._lastActiveItem = legendItem;
    const selected = legendItem.hasState(LegendStateValue.selected);

    if (selected) {
      // use selectedHover state
      this._setLegendItemState(legendItem, LegendStateValue.selectedHover, e);
    } else {
      // use unSelectedHover state
      this._setLegendItemState(legendItem, LegendStateValue.unSelectedHover, e);
    }

    const focusButton = (legendItem.getChildren()[0] as unknown as IGroup).find(
      node => node.name === LEGEND_ELEMENT_NAME.focus,
      false
    ) as IGraphic;
    if (focusButton) {
      focusButton.setAttribute('visible', true);
    }

    this._dispatchLegendEvent(LegendEvent.legendItemHover, legendItem, e);
  }

  private _unHover(legendItem: IGroup, e: FederatedPointerEvent) {
    let attributeUpdate = false;
    if (legendItem.hasState(LegendStateValue.unSelectedHover) || legendItem.hasState(LegendStateValue.selectedHover)) {
      attributeUpdate = true;
    }
    legendItem.removeState(LegendStateValue.unSelectedHover);
    legendItem.removeState(LegendStateValue.selectedHover);
    legendItem
      .getChildren()[0]
      .getChildren()
      .forEach((child: any) => {
        if (
          !attributeUpdate &&
          (child.hasState(LegendStateValue.unSelectedHover) || child.hasState(LegendStateValue.selectedHover))
        ) {
          attributeUpdate = true;
        }
        (child as unknown as IGraphic).removeState(LegendStateValue.unSelectedHover);
        (child as unknown as IGraphic).removeState(LegendStateValue.selectedHover);
      });

    const focusButton = (legendItem.getChildren()[0] as unknown as IGroup).find(
      node => node.name === LEGEND_ELEMENT_NAME.focus,
      false
    ) as IGraphic;
    if (focusButton) {
      focusButton.setAttribute('visible', false);
    }

    if (attributeUpdate) {
      this._dispatchLegendEvent(LegendEvent.legendItemAttributeUpdate, legendItem, e);
    }
    this._dispatchLegendEvent(LegendEvent.legendItemUnHover, legendItem, e);
  }

  private _setLegendItemState(legendItem: IGroup, stateName: string, e?: FederatedPointerEvent) {
    const keepCurrentStates = true;
    let attributeUpdate = false;
    if (!legendItem.hasState(stateName)) {
      attributeUpdate = true;
    }
    legendItem.addState(stateName, keepCurrentStates);
    // TODO: 这个比较 hack
    legendItem
      .getChildren()[0]
      .getChildren()
      .forEach((child: IGraphic) => {
        if (child.name !== LEGEND_ELEMENT_NAME.focus) {
          if (!attributeUpdate && !child.hasState(stateName)) {
            attributeUpdate = true;
          }
          (child as unknown as IGraphic).addState(stateName, keepCurrentStates);
        }
      });
    if (attributeUpdate) {
      this._dispatchLegendEvent(LegendEvent.legendItemAttributeUpdate, legendItem, e);
    }
  }

  private _removeLegendItemState(legendItem: IGroup, stateNames: string[], e?: FederatedPointerEvent) {
    let attributeUpdate = false;
    stateNames.forEach(name => {
      if (!attributeUpdate && legendItem.hasState(name)) {
        attributeUpdate = true;
      }
      legendItem.removeState(name);
    });
    // TODO: 这个比较 hack
    legendItem
      .getChildren()[0]
      .getChildren()
      .forEach(child => {
        if (child.name !== LEGEND_ELEMENT_NAME.focus) {
          stateNames.forEach(name => {
            if (!attributeUpdate && (child as unknown as IGraphic).hasState(name)) {
              attributeUpdate = true;
            }
            (child as unknown as IGraphic).removeState(name);
          });
        }
      });
    if (attributeUpdate) {
      this._dispatchLegendEvent(LegendEvent.legendItemAttributeUpdate, legendItem, e);
    }
  }

  // 获取当前选中的图例项
  private _getSelectedLegends() {
    const selectedData: LegendItemDatum[] = [];
    this._itemsContainer?.getChildren().forEach(item => {
      if ((item as unknown as IGroup).hasState(LegendStateValue.selected)) {
        // @ts-ignore
        selectedData.push(item.data);
      }
    });

    return selectedData;
  }

  private _appendDataToShape(shape: any, name: string, data: any, delegateShape: any, states: any = {}) {
    shape.name = name;
    shape.data = data;
    shape.delegate = delegateShape;
    shape.states = merge({}, DEFAULT_STATES, states);
  }

  private _dispatchLegendEvent(eventName: string, legendItem: any, event: FederatedPointerEvent) {
    const currentSelectedItems = this._getSelectedLegends();
    // 需要保持显示顺序
    currentSelectedItems.sort((pre: LegendItemDatum, next: LegendItemDatum) => pre.index - next.index);

    const currentSelected = currentSelectedItems.map((obj: LegendItemDatum) => obj.label);

    this._dispatchEvent(eventName, {
      item: legendItem, // 当前被选中的图例项整体
      data: legendItem.data, // 当前图例项的数据
      selected: legendItem.hasState(LegendStateValue.selected), // 当前图例项是否被选中
      currentSelectedItems,
      currentSelected,
      event
    });
  }

  // 处理回调函数
  private _handleStyle(
    config: any,
    item: LegendItemDatum,
    isSelected: boolean,
    index: number,
    items: LegendItemDatum[]
  ) {
    const newConfig: any = {};
    // 处理下样式
    if (config.style) {
      if (isFunction(config.style)) {
        newConfig.style = config.style(item, isSelected, index, items);
      } else {
        newConfig.style = config.style;
      }
    }

    if (config.state) {
      newConfig.state = {};

      Object.keys(config.state).forEach(key => {
        if (config.state[key]) {
          if (isFunction(config.state[key])) {
            newConfig.state[key] = config.state[key](item, isSelected, index, items);
          } else {
            newConfig.state[key] = config.state[key];
          }
        }
      });
    }

    return newConfig;
  }

  release(): void {
    super.release();
    this.removeAllEventListeners();
  }
}
