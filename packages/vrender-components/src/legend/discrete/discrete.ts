/**
 * @description 离散图例
 * @author 章伟星
 */
import { merge, isEmpty, normalizePadding, get, isValid, isNil, isFunction, isArray, max } from '@visactor/vutils';
import type {
  FederatedPointerEvent,
  IGroup,
  IGraphic,
  INode,
  IGroupGraphicAttribute,
  ISymbolGraphicAttribute,
  ITextGraphicAttribute,
  CustomEvent
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
      maxHeight,
      defaultSelected = [],
      lazyload
    } = this.attribute as DiscreteLegendAttrs;
    const { spaceCol = DEFAULT_ITEM_SPACE_COL, spaceRow = DEFAULT_ITEM_SPACE_ROW } = itemAttrs;

    const itemsContainer = this._itemsContainer;
    const { items: legendItems, isHorizontal, startIndex } = this._itemContext;
    const maxPages = isHorizontal ? maxRow : maxCol;

    let { doWrap, maxWidthInCol, startX, startY, pages } = this._itemContext;
    let item: LegendItemDatum;

    for (let index = startIndex, len = legendItems.length; index < len; index++) {
      if (lazyload && pages > this._itemContext.currentPage * maxPages) {
        this._itemContext.startIndex = index;
        break;
      }
      item = legendItems[index];

      if (!item.id) {
        item.id = item.label; // 如果没有设置 id，默认使用 label
      }
      item.index = index; // 用于维护图例的顺序

      const itemGroup = this._renderEachItem(
        item,
        isEmpty(defaultSelected) ? true : defaultSelected?.includes(item.label),
        index,
        legendItems
      );
      const itemWidth = itemGroup.attribute.width;
      const itemHeight = itemGroup.attribute.height;
      this._itemHeight = Math.max(this._itemHeight, itemHeight);
      maxWidthInCol = Math.max(itemWidth, maxWidthInCol);

      this._itemMaxWidth = Math.max(itemWidth, this._itemMaxWidth);

      if (isHorizontal) {
        // 水平布局
        if (isValid(maxWidth)) {
          if (itemWidth >= maxWidth) {
            // 如果图例项本身就大于 maxWidth
            doWrap = true;
            if (index > 0) {
              startX = 0;
              startY += itemHeight + spaceRow;
              pages += 1;
            }
          } else if (maxWidth < startX + itemWidth) {
            // 检测是否需要换行：如果用户声明了 maxWidth 并且超出了，则进行换行
            doWrap = true;
            startX = 0;
            startY += itemHeight + spaceRow;
            pages += 1;
          }
        }
        if (index > 0) {
          itemGroup.setAttributes({
            x: startX,
            y: startY
          });
        }
        startX += spaceCol + itemWidth;
      } else {
        // 垂直布局
        if (isValid(maxHeight) && maxHeight < startY + itemHeight) {
          // 检测是否换列：如果用户声明了 maxHeight 并且超出了，则进行换列
          doWrap = true;
          startY = 0;
          startX += maxWidthInCol + spaceCol;
          maxWidthInCol = 0;
          pages += 1;
        }
        if (index > 0) {
          itemGroup.setAttributes({
            x: startX,
            y: startY
          });
        }
        startY += spaceRow + itemHeight;
      }

      itemsContainer.add(itemGroup);
    }

    this._itemContext.doWrap = doWrap;
    this._itemContext.startX = startX;
    this._itemContext.startY = startY;
    this._itemContext.maxWidthInCol = maxWidthInCol;
    this._itemContext.pages = pages;
    this._itemContext.maxPages = maxPages;

    if (!lazyload) {
      this._itemContext.startIndex = legendItems.length;
    }

    return this._itemContext;
  }

  protected _renderContent() {
    const { item = {}, items, reversed } = this.attribute as DiscreteLegendAttrs;
    if (item.visible === false || isEmpty(items)) {
      return;
    }

    let legendItems = items;
    if (reversed) {
      legendItems = items?.reverse();
    }

    const itemsContainer = graphicCreator.group({
      x: 0,
      y: 0
    });
    this._itemsContainer = itemsContainer;

    const { layout, autoPage } = this.attribute;
    const isHorizontal = layout === 'horizontal';

    const { maxWidth: maxItemWidth, width: itemWidth, height: itemHeight } = item;

    // 根据用户声明的 maxItemWidth 和 itemWidth 获取图例项宽度
    if (isValid(maxItemWidth)) {
      if (isValid(itemWidth)) {
        this._itemWidthByUser = Math.min(maxItemWidth, itemWidth);
      } else {
        this._itemWidthByUser = maxItemWidth;
      }
    } else if (isValid(itemWidth)) {
      this._itemWidthByUser = itemWidth;
    }

    // 存储用户指定图例项高度
    if (isValid(itemHeight)) {
      this._itemHeightByUser = itemHeight;
    }

    this._itemContext = {
      currentPage: this.attribute.pager ? this.attribute.pager.defaultCurrent || 1 : 1,
      doWrap: false,
      maxWidthInCol: 0,
      maxPages: 1,
      pages: 1,
      startX: 0,
      startY: 0,
      startIndex: 0,
      items: legendItems,
      isHorizontal,
      totalPage: Infinity
    };

    this._itemContext = this._renderItems();

    // TODO: 添加测试用例
    let pagerRendered = false;
    if (this._itemContext.doWrap && autoPage && this._itemContext.pages > this._itemContext.maxPages) {
      // 进行分页处理
      pagerRendered = this._renderPagerComponent(isHorizontal);
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
      this._itemsContainer.addEventListener('pointermove', this._onHover as EventListenerOrEventListenerObject);
      this._itemsContainer.addEventListener('pointerleave', this._onUnHover as EventListenerOrEventListenerObject);
    }

    if (select) {
      this._itemsContainer.addEventListener('pointerdown', this._onClick as EventListenerOrEventListenerObject);
    }
  }

  private _renderEachItem(item: LegendItemDatum, isSelected: boolean, index: number, items: LegendItemDatum[]) {
    const { id, label, value, shape } = item;
    const { padding = 0, focus, focusIconStyle } = this.attribute.item as LegendItem;

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

    let focusShape;
    let focusSpace = 0;

    if (focus) {
      const focusSize = get(focusIconStyle, 'size', DEFAULT_SHAPE_SIZE);
      // 绘制聚焦按钮
      focusShape = graphicCreator.symbol({
        x: 0,
        y: -focusSize / 2 - 1,
        strokeBoundsBuffer: 0,
        ...focusIconStyle,
        visible: true,
        pickMode: 'imprecise',
        boundsPadding: parsedPadding
      });
      this._appendDataToShape(focusShape, LEGEND_ELEMENT_NAME.focus, item, itemGroup);

      focusSpace = focusSize;
    }

    const labelShape = graphicCreator.text({
      x: shapeSize / 2 + shapeSpace,
      y: 0,
      textAlign: 'start',
      textBaseline: 'middle',
      lineHeight: (labelStyle.style as ITextGraphicAttribute)?.fontSize,
      ...labelStyle.style,
      text: labelAttr.formatMethod ? labelAttr.formatMethod(label, item, index) : label
    });
    this._appendDataToShape(labelShape, LEGEND_ELEMENT_NAME.itemLabel, item, itemGroup, labelStyle.state);
    labelShape.addState(isSelected ? LegendStateValue.selected : LegendStateValue.unSelected);
    innerGroup.add(labelShape);
    const labelSpace = get(labelAttr, 'space', DEFAULT_LABEL_SPACE);
    if (isValid(value)) {
      const valueSpace = get(valueAttr, 'space', focus ? DEFAULT_VALUE_SPACE : 0);
      const valueShape = graphicCreator.text({
        x: 0,
        y: 0,
        textAlign: 'start',
        textBaseline: 'middle',
        lineHeight: (valueStyle.style as ITextGraphicAttribute).fontSize,
        ...valueStyle.style,
        text: valueAttr.formatMethod ? valueAttr.formatMethod(value, item, index) : value
      });
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
        const valueBounds = valueShape.AABBBounds;
        const labelBounds = labelShape.AABBBounds;
        const valueWidth = valueBounds.width();
        const labelWidth = labelBounds.width();
        if (labelWidth > layoutWidth) {
          if ((layoutWidth - valueWidth) / labelWidth > 0.4) {
            // 设置一个值，如果剩余的宽度和 label 自身的比例不低于 0.4 的话，优先展示全 label
            labelShape.setAttribute('maxLineWidth', layoutWidth - valueWidth);
          } else {
            valueShape.setAttribute('maxLineWidth', layoutWidth * 0.5);
            labelShape.setAttribute('maxLineWidth', layoutWidth * 0.5);
          }
        } else {
          valueShape.setAttribute('maxLineWidth', layoutWidth - labelWidth);
        }

        if (valueAttr.alignRight) {
          valueShape.setAttributes({
            // @ts-ignore
            textAlign: 'right',
            x: this._itemWidthByUser - shapeSize / 2 - parsedPadding[1] - parsedPadding[3] - focusSpace - valueSpace
          });
        } else {
          valueShape.setAttribute('x', labelShape.AABBBounds.x2 + valueSpace);
        }
      } else {
        valueShape.setAttribute('x', labelShape.AABBBounds.x2 + valueSpace);
      }
      focusStartX = valueShape.AABBBounds.x2 + valueSpace;

      innerGroup.add(valueShape);
    } else if (this._itemWidthByUser) {
      labelShape.setAttribute(
        'maxLineWidth',
        this._itemWidthByUser - parsedPadding[1] - parsedPadding[3] - shapeSize - shapeSpace - focusSpace
      );

      focusStartX = labelShape.AABBBounds.x2 + labelSpace;
    } else {
      focusStartX = labelShape.AABBBounds.x2 + labelSpace;
    }

    if (focusShape) {
      focusShape.setAttribute('x', focusStartX);
      innerGroup.add(focusShape);
    }

    const innerGroupBounds = innerGroup.AABBBounds;
    const innerGroupWidth = innerGroupBounds.width();
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

  private _createPager(
    isScrollbar: boolean,
    isHorizontal: boolean,
    compStyle: LegendScrollbarAttributes,
    compSize: number
  ) {
    const { disableTriggerEvent, maxRow } = this.attribute;
    if (isScrollbar) {
      return isHorizontal
        ? new ScrollBar({
            direction: 'vertical',
            width: 12,
            range: [0, 0.5],
            ...compStyle,
            height: compSize,
            disableTriggerEvent
          })
        : new ScrollBar({
            direction: 'horizontal',
            disableTriggerEvent,
            range: [0, 0.5],
            height: 12,
            ...compStyle,
            width: compSize
          });
    }

    return isHorizontal
      ? new Pager({
          layout: maxRow === 1 ? 'horizontal' : 'vertical',
          total: 99,
          ...merge(
            {
              handler: {
                preShape: 'triangleUp',
                nextShape: 'triangleDown'
              }
            },
            compStyle
          ),
          disableTriggerEvent
        })
      : new Pager({
          layout: 'horizontal',
          total: 99, // 用于估算,
          disableTriggerEvent,
          ...compStyle
        });
  }

  private _updatePositionOfPager(
    isScrollbar: boolean,
    isHorizontal: boolean,
    contentSize: number,
    renderStartY: number,
    compSize: number
  ) {
    const { maxHeight, pager } = this.attribute;
    const { currentPage, totalPage } = this._itemContext;

    if (isScrollbar) {
      (this._pagerComponent as ScrollBar).setScrollRange([(currentPage - 1) / totalPage, currentPage / totalPage]);
      if (isHorizontal) {
        (this._pagerComponent as ScrollBar).setAttributes({
          x: contentSize,
          y: renderStartY
        });
      } else {
        (this._pagerComponent as ScrollBar).setAttributes({
          x: 0,
          y: (maxHeight as number) - this._pagerComponent.AABBBounds.height()
        });
      }
    } else {
      const position = (pager && pager.position) || 'middle';
      (this._pagerComponent as Pager).setTotal(totalPage);

      if (isHorizontal) {
        let y;
        if (position === 'start') {
          y = renderStartY;
        } else if (position === 'end') {
          y = renderStartY + compSize - this._pagerComponent.AABBBounds.height() / 2;
        } else {
          y = renderStartY + compSize / 2 - this._pagerComponent.AABBBounds.height() / 2;
        }
        this._pagerComponent.setAttributes({
          x: contentSize,
          y
        });
      } else {
        let x;
        if (position === 'start') {
          x = 0;
        } else if (position === 'end') {
          x = compSize - this._pagerComponent.AABBBounds.width();
        } else {
          x = (compSize - this._pagerComponent.AABBBounds.width()) / 2;
        }
        this._pagerComponent.setAttributes({
          x,
          y: (maxHeight as number) - this._pagerComponent.AABBBounds.height()
        });
      }
    }
  }

  private _bindEventsOfPager(isScrollbar: boolean, isHorizontal: boolean, compSize: number, spaceSize: number) {
    const {
      animation = true,
      animationDuration = 450,
      animationEasing = 'quadIn',
      scrollByPosition
    } = this.attribute.pager || {};
    const pageParser = isScrollbar
      ? (e: CustomEvent) => {
          const { value } = e.detail;
          let newPage = value[0] * this._itemContext.totalPage;

          if (scrollByPosition) {
            newPage = newPage + 1;
          } else {
            newPage = Math.floor(newPage) + 1;
          }

          return newPage;
        }
      : (e: CustomEvent) => {
          return e.detail.current;
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
        (this._pagerComponent as ScrollBar).setScrollRange([(newPage - 1) / newTotalPage, newPage / newTotalPage]);
      }

      if (animation) {
        (this._itemsContainer as IGroup)
          .animate()
          .to(
            isHorizontal
              ? { y: -(newPage - 1) * (compSize + spaceSize) }
              : { x: -(newPage - 1) * (compSize + spaceSize) },
            animationDuration,
            animationEasing
          );
      } else {
        if (isHorizontal) {
          (this._itemsContainer as IGroup).setAttribute('y', -(newPage - 1) * (compSize + spaceSize));
        } else {
          (this._itemsContainer as IGroup).setAttribute('x', -(newPage - 1) * (compSize + spaceSize));
        }
      }
    };
    if (isScrollbar) {
      this._pagerComponent.addEventListener('scrollDrag', onPaging);
      this._pagerComponent.addEventListener('scrollUp', onPaging);
    } else {
      this._pagerComponent.addEventListener('toPrev', onPaging);
      this._pagerComponent.addEventListener('toNext', onPaging);
    }
  }

  private _renderPagerComponent(isHorizontal: boolean) {
    const renderStartY = this._title ? this._title.AABBBounds.height() + get(this.attribute, 'title.space', 8) : 0;
    const { maxWidth, maxHeight, maxCol = 1, maxRow = 2, item = {}, pager = {} } = this.attribute;
    const { spaceCol = DEFAULT_ITEM_SPACE_COL, spaceRow = DEFAULT_ITEM_SPACE_ROW } = item;
    const itemsContainer = this._itemsContainer as IGroup;
    const { type, space: pagerSpace = DEFAULT_PAGER_SPACE, defaultCurrent = 1, ...compStyle } = pager;
    const isScrollbar = type === 'scrollbar';

    let comp: ScrollBar | Pager;
    let compSize = 0; // 组件的大小
    let contentSize = 0; // 内容的大小
    let startX = 0; // 临时变量，用来存储布局的起始点
    let startY = 0; // 临时变量，用来存储布局的起始点
    let pages = 1; // 页数

    if (isHorizontal) {
      compSize = (maxRow - 1) * spaceRow + this._itemHeight * maxRow;
      // 水平布局，支持上下翻页
      comp = this._createPager(isScrollbar, isHorizontal, compStyle, compSize);
      this._pagerComponent = comp;
      this._innerView.add(comp as unknown as INode);
      contentSize = (maxWidth as number) - comp.AABBBounds.width() - pagerSpace;

      if (contentSize <= 0) {
        // 布局空间不够则不进行分页器渲染
        this._innerView.removeChild(comp as unknown as INode);
        return false;
      }

      // 重新进行布局
      (itemsContainer.getChildren() as unknown as IGroup[]).forEach((item, index) => {
        const { width, height } = item.attribute;

        if (contentSize < startX + (width as number)) {
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

      this._updatePositionOfPager(isScrollbar, isHorizontal, contentSize, renderStartY, compSize);
    } else {
      compSize = this._itemMaxWidth * maxCol + (maxCol - 1) * spaceCol;
      // 垂直布局，支持左右翻页
      comp = this._createPager(isScrollbar, isHorizontal, compStyle, compSize);
      this._pagerComponent = comp;
      this._innerView.add(comp as unknown as INode);

      contentSize = (maxHeight as number) - comp.AABBBounds.height() - pagerSpace - renderStartY;

      if (contentSize <= 0) {
        // 布局空间不够则不进行分页器渲染
        this._innerView.removeChild(comp as unknown as INode);
        return false;
      }

      // 重新进行布局
      (itemsContainer.getChildren() as unknown as IGroup[]).forEach((item, index) => {
        const { height } = item.attribute;
        if (contentSize < startY + (height as number)) {
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
      this._updatePositionOfPager(isScrollbar, isHorizontal, contentSize, renderStartY, compSize);
    }

    // 初始化 defaultCurrent
    if (defaultCurrent > 1) {
      if (isHorizontal) {
        itemsContainer.setAttribute('y', -(defaultCurrent - 1) * (compSize + spaceRow));
      } else {
        itemsContainer.setAttribute('x', -(defaultCurrent - 1) * (compSize + spaceCol));
      }
    }

    const clipGroup = graphicCreator.group({
      x: 0,
      y: renderStartY,
      width: isHorizontal ? contentSize : compSize,
      height: isHorizontal ? compSize : contentSize,
      clip: true,
      pickable: false
    });
    clipGroup.add(itemsContainer);
    this._innerView.add(clipGroup);

    this._bindEventsOfPager(isScrollbar, isHorizontal, compSize, isHorizontal ? spaceRow : spaceCol);

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

      // 图例聚焦功能
      if (target.name === LEGEND_ELEMENT_NAME.focus) {
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
        const { selectMode = 'multiple', allowAllCanceled = true } = this.attribute;
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
}
