import { generateColField } from './tools';
import { isValid, merge, normalizePadding } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { TableSeriesNumberAttributes } from './type';
import type { FederatedPointerEvent, Group, IGroup, IText } from '@visactor/vrender-core';
import { Image, Rect, Text, createGroup, graphicCreator, parsePadding } from '@visactor/vrender-core';
import type { ComponentOptions } from '../interface';
import { loadTableSeriesNumberComponent } from './register';
export enum SeriesNumberCellStateValue {
  hover = 'hover',
  select = 'select'
}
export enum SeriesNumberEvent {
  seriesNumberCellHover = 'seriesNumberCellHover',
  seriesNumberCellUnHover = 'seriesNumberCellUnHover',
  seriesNumberCellClick = 'seriesNumberCellClick',
  seriesNumberCellCancelClick = 'seriesNumberCellCancelClick',
  rowSeriesNumberWidthChange = 'rowSeriesNumberWidthChange'
}
const cornerSvg =
  '<svg t="1716726614852" class="icon" viewBox="0 0 1194 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2621" width="200" height="200"><path d="M1038.694079 367.237067c13.265507 23.342857-16.633865-40.004445-63.05621-40.004446H219.018794c-26.558738 0-46.46393 13.334815-63.05621 40.004446S0.006238 607.277601 0.006238 650.608819V940.647979a82.351494 82.351494 0 0 0 82.961402 83.349526H1111.702885a82.337632 82.337632 0 0 0 82.975264-83.349526V650.608819c0-43.331218-155.970208-283.371753-155.970208-283.371752zM730.066575 667.284269a136.328386 136.328386 0 0 1-132.738243 133.33429 133.417459 133.417459 0 0 1-132.738243-133.33429v-6.681269a40.6698 40.6698 0 0 0-36.497473-26.66963H73.015044l119.458874-220.02445s23.231965-40.004445 53.103614-40.004446h713.481918c26.544876 0 29.871649 10.008042 46.436207 40.004446L1128.33675 633.947231H769.904682c-26.184476 0-39.838107 7.623855-39.838107 33.337038zM338.505391 210.559919l-89.601086-86.69016a22.178487 22.178487 0 0 1 0-33.26773 21.984425 21.984425 0 0 1 33.170699 0l89.601087 86.676299a22.317102 22.317102 0 0 1 0 33.26773 24.950798 24.950798 0 0 1-33.1707 0z m252.197118-40.059891a25.532983 25.532983 0 0 1-6.639685-16.633865l-3.326773-126.694606A28.263709 28.263709 0 0 1 603.995739 0.515788c13.251646-3.326773 23.204242 10.021904 26.544877 23.342858V153.866163a28.249847 28.249847 0 0 1-23.259688 26.66963c-6.611961-3.312911-13.279369-3.312911-16.578419-10.035765z m235.646421 33.337038a22.372548 22.372548 0 0 1 0-33.337038l86.288175-90.030795a22.039871 22.039871 0 0 1 33.170699 0 22.289379 22.289379 0 0 1 0 33.364761l-82.961401 90.003072a25.962691 25.962691 0 0 1-36.483611 0z" fill="#8a8a8a" p-id="2622"></path></svg>';

loadTableSeriesNumberComponent();
export class TableSeriesNumber extends AbstractComponent<Required<TableSeriesNumberAttributes>> {
  static defaultAttributes: Partial<TableSeriesNumberAttributes> = {
    frozenRowCount: 0,
    frozenColCount: 0,
    rightFrozenColCount: 0,
    bottomFrozenRowCount: 0,
    pickable: false,
    rowCount: 100,
    colCount: 100,
    rowSeriesNumberWidth: 'auto',
    colSeriesNumberHeight: 'auto',
    rowSeriesNumberCellStyle: {
      text: {
        fontSize: 14,
        fill: '#7A7A7A',
        pickable: false,
        boundsPadding: 4
      },
      borderLine: {
        stroke: 'red', // '#D9D9D9',
        lineWidth: 1,
        pickable: false
      },
      bgColor: '#F9F9F9',
      states: {
        hover: {
          fill: 'red',
          opacity: 0.7
        },
        select: {
          fill: 'yellow',
          opacity: 0.7
        }
      }
    },
    colSeriesNumberCellStyle: {
      text: {
        fontSize: 14,
        fill: '#7A7A7A',
        pickable: false
      },
      borderLine: {
        stroke: '#D9D9D9',
        lineWidth: 1,
        pickable: false
      },
      bgColor: '#F9F9F9',
      states: {
        hover: {
          fill: '#98C8A5',
          opacity: 0.7
        },
        select: {
          fill: 'orange',
          opacity: 0.7
        }
      }
    },
    cornerCellStyle: {
      borderLine: {
        stroke: '#D9D9D9',
        lineWidth: 1,
        pickable: false
      },
      bgColor: '#F9F9F9',
      states: {
        hover: {
          fill: '#98C8A5',
          opacity: 0.7
        },
        select: {
          fill: '#98C8A5',
          opacity: 0.7
        }
      }
    }
  };
  name = 'tableSeriesNumber';
  protected _tableSeriesNumberContainer: IGroup;
  // protected _title: Tag | null = null;
  _cornerGroup: IGroup;
  _rowSeriesNumberGroup: IGroup;
  _colSeriesNumberGroup: IGroup;
  _frozenTopRowSeriesNumberGroup: IGroup;
  _frozenLeftColSeriesNumberGroup: IGroup;
  _frozenRightColSeriesNumberGroup: IGroup;
  _frozenBottomRowSeriesNumberGroup: IGroup;
  _lastHoverItem: IGroup;
  // _lastClickItem: IGroup;
  // 记录rowSeriesNumberGroup中第一个元素的索引
  _firstRowSeriesNumberIndex: number = 0;
  // 记录colSeriesNumberGroup中第一个元素的索引
  _firstColSeriesNumberIndex: number = 0;
  // 文字最大宽度
  _maxTextWidth: number = 0;
  _changeRowSeriesNumberWidthTimer: number = null;
  interactionState: {
    selectIndexs?: Set<string>; //记录选中的行号或列号 cellGroup的name
    // selectColIndexs?:number[],
  } = { selectIndexs: new Set() };
  constructor(attributes: TableSeriesNumberAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, TableSeriesNumber.defaultAttributes, attributes));
    this._skipRenderAttributes.push('frozenTopRow');
    this._skipRenderAttributes.push('frozenLeftCol');
    this._skipRenderAttributes.push('frozenRightCol');
    this._skipRenderAttributes.push('frozenBottomRow');
    this._skipRenderAttributes.push('rowCount');
    this._skipRenderAttributes.push('colCount');
    // this.render();
  }
  get rowSeriesNumberWidth() {
    const { rowSeriesNumberWidth } = this.attribute;
    if (this._maxTextWidth) {
      const textPadding = parsePadding(this.attribute.rowSeriesNumberCellStyle.text.boundsPadding);
      let totalPadding = 0;
      if (typeof textPadding === 'number') {
        totalPadding = textPadding * 2;
      } else {
        totalPadding = textPadding[3] + textPadding[1];
      }
      return Math.max(
        this._maxTextWidth + totalPadding,
        typeof rowSeriesNumberWidth === 'number' ? rowSeriesNumberWidth : 20
      );
    }
    return typeof rowSeriesNumberWidth === 'number' ? rowSeriesNumberWidth : 20;
  }
  get colSeriesNumberHeight() {
    const { colSeriesNumberHeight } = this.attribute;
    return typeof colSeriesNumberHeight === 'number' ? colSeriesNumberHeight : 20;
  }
  get rowCount() {
    const { rowCount } = this.attribute;
    return rowCount;
  }
  get colCount() {
    const { colCount } = this.attribute;
    return colCount;
  }
  render() {
    // this.removeAllChild(true);
    const {
      rowCount,
      colCount,
      rowSeriesNumberWidth,
      colSeriesNumberHeight,
      rowSeriesNumberCellStyle,
      colSeriesNumberCellStyle,
      rowHeight,
      colWidth
    } = this.attribute;
    // 创建一个内部的 container 用于存储所有的元素
    const innerView = this.createOrUpdateChild(
      'tableSeriesNumberContainer',
      {
        x: 0,
        y: 0,
        fill: 'rgba(1,1,1,0)',
        width: this.rowSeriesNumberWidth + colCount * (typeof colWidth === 'number' ? colWidth : 20),
        height: this.colSeriesNumberHeight + rowCount * (typeof rowHeight === 'number' ? rowHeight : 20),
        pickable: false,
        childrenPickable: true
      },
      'group'
    ) as IGroup;
    // innerView.name = LEGEND_ELEMENT_NAME.innerView;
    // this.add(innerView);
    this._tableSeriesNumberContainer = innerView;

    this._renderContent();

    // this._bindEvents();
  }
  _renderContent() {
    this._renderRowSeriesNumber();
    this._renderColSeriesNumber();
    // this.refreshRowSeriesNumberGroup(0,100);

    this._renderFrozenTopRowSeriesNumber();
    this._renderFrozenLeftColSeriesNumber();
    this._renderCorner();
    // this._renderFrozenRightSeriesNumber();
    // this._renderFrozenBottomSeriesNumber();
  }
  _renderCorner() {
    const {
      rowCount,
      colCount,
      cornerCellStyle: cornerSeriesNumberCellStyle,
      rowSeriesNumberWidth,
      colSeriesNumberHeight,
      rowSeriesNumberCellStyle,
      colSeriesNumberCellStyle,
      rowHeight,
      colWidth
    } = this.attribute;
    // 组织角头
    const cornerGroup = this._tableSeriesNumberContainer.createOrUpdateChild(
      'cornerSeriesNumberCell',
      {
        x: 0,
        y: 0,
        fill: cornerSeriesNumberCellStyle.bgColor,
        stroke: cornerSeriesNumberCellStyle.borderLine.stroke,
        lineWidth: cornerSeriesNumberCellStyle.borderLine.lineWidth,
        pickable: true,
        width: this.rowSeriesNumberWidth,
        height: this.colSeriesNumberHeight
      },
      'group'
    ) as IGroup;
    // cornerGroup.name = `conerSeriesNumberCell`;
    cornerGroup.id = '0,0';
    cornerGroup.states = cornerSeriesNumberCellStyle.states;
    // this._tableSeriesNumberContainer.add(cornerGroup);
    this._cornerGroup = cornerGroup;
  }
  _renderRowSeriesNumber() {
    const {
      frozenRowCount,
      rowCount,
      colCount,
      rowSeriesNumberWidth,
      colSeriesNumberHeight,
      rowSeriesNumberCellStyle,
      colSeriesNumberCellStyle,
      rowHeight,
      colWidth
    } = this.attribute;

    //组织行号Group
    const rowSeriesNumberGroup = this._tableSeriesNumberContainer.createOrUpdateChild(
      'rowSeriesNumberCellGroup',
      {
        x: 0,
        y: this.colSeriesNumberHeight, //后续setFrozenRowCount会重新设置y
        pickable: true,
        fill: rowSeriesNumberCellStyle.bgColor,
        width: this.rowSeriesNumberWidth,
        height: rowCount * (typeof rowHeight === 'number' ? rowHeight : 20)
      },
      'group'
    ) as IGroup;
    // this._tableSeriesNumberContainer.add(rowSeriesNumberGroup);
    this._rowSeriesNumberGroup = rowSeriesNumberGroup;
    // //组织每个行号单元格
    // for (let i = 0; i < rowCount - frozenRowCount; i++) {
    //   const cellGroup =  this._rowSeriesNumberGroup.createOrUpdateChild(`rowSeriesNumberCell-${i}`,{
    //     x: 0,
    //     y: i * (typeof rowHeight === 'number' ? rowHeight : 20),
    //     pickable: true,
    //     fill: rowSeriesNumberCellStyle.bgColor,
    //     stroke: rowSeriesNumberCellStyle.borderLine.stroke,
    //     lineWidth: rowSeriesNumberCellStyle.borderLine.lineWidth,
    //     width: this.rowSeriesNumberWidth,
    //     height: typeof rowHeight === 'number' ? rowHeight : 20
    //   },'group') as IGroup;
    //   // cellGroup.name = `rowSeriesNumberCell-${i}`;
    //   cellGroup.id = i;
    //   cellGroup.states = rowSeriesNumberCellStyle.states;
    //   // rowSeriesNumberGroup.add(cellGroup);

    //   const text = cellGroup.createOrUpdateChild(`rowSeriesNumberCellText-${i}`,{
    //     x: 0,
    //     y: typeof rowHeight === 'number' ? rowHeight : 20,
    //     text: `${i + 1 + frozenRowCount}`,
    //     pickable: false,
    //     ...rowSeriesNumberCellStyle.text
    //     },'text');
    //   // cellGroup.add(text);
    // }
  }
  _renderColSeriesNumber() {
    const {
      frozenColCount,
      rowCount,
      colCount,
      rowSeriesNumberWidth,
      colSeriesNumberHeight,
      rowSeriesNumberCellStyle,
      colSeriesNumberCellStyle,
      rowHeight,
      colWidth
    } = this.attribute;
    //组织列号Group
    const colSeriesNumberGroup = this._tableSeriesNumberContainer.createOrUpdateChild(
      'colSeriesNumberCellGroup',
      {
        x: this.rowSeriesNumberWidth + frozenColCount * (typeof colWidth === 'number' ? colWidth : 20),
        y: 0,
        pickable: true,
        fill: colSeriesNumberCellStyle.bgColor,
        width: colCount * (typeof colWidth === 'number' ? colWidth : 20),
        height: this.colSeriesNumberHeight
      },
      'group'
    ) as IGroup;
    // this._tableSeriesNumberContainer.add(colSeriesNumberGroup);
    this._colSeriesNumberGroup = colSeriesNumberGroup;
    // //组织每个列号单元格
    // for (let i = 0; i < colCount - frozenColCount; i++) {
    //   const cellGroup = this._colSeriesNumberGroup.createOrUpdateChild(`colSeriesNumberCell-${i}`,{
    //     x: i * (typeof colWidth === 'number' ? colWidth : 20),
    //     y: 0,
    //     pickable: true,
    //     fill: colSeriesNumberCellStyle.bgColor,
    //     stroke: colSeriesNumberCellStyle.borderLine.stroke,
    //     width: typeof colWidth === 'number' ? colWidth : 20,
    //     height: this.colSeriesNumberHeight
    //   },'group') as IGroup;
    //   // cellGroup.name = `colSeriesNumberCell-${i}`;
    //   cellGroup.id = i;
    //   // colSeriesNumberGroup.add(cellGroup);
    //   const text = cellGroup.createOrUpdateChild(`colSeriesNumberCellText-${i}`,{
    //     x: 0,
    //     y: this.colSeriesNumberHeight,
    //     text: generateColField(i + frozenColCount),
    //     pickable: false,
    //     ...colSeriesNumberCellStyle.text
    //   },'text');
    //   // cellGroup.add(text);
    //   cellGroup.states = colSeriesNumberCellStyle.states;
    // }
  }
  _renderFrozenTopRowSeriesNumber() {
    const {
      frozenRowCount,
      colCount,
      rowSeriesNumberWidth,
      colSeriesNumberHeight,
      rowSeriesNumberCellStyle,
      colSeriesNumberCellStyle,
      rowHeight,
      colWidth
    } = this.attribute;
    const frozenTopSeriesNumberGroup = this._tableSeriesNumberContainer.createOrUpdateChild(
      'frozenTopSeriesNumberGroup',
      {
        x: 0,
        y: this.colSeriesNumberHeight,
        width: this.rowSeriesNumberWidth,
        height: frozenRowCount * (typeof rowHeight === 'number' ? rowHeight : 20)
      },
      'group'
    ) as IGroup;
    this._frozenTopRowSeriesNumberGroup = frozenTopSeriesNumberGroup;
    // for (let i = 0; i < frozenRowCount; i++) {
    //   const cellGroup =  this._frozenTopRowSeriesNumberGroup.createOrUpdateChild(`rowSeriesNumberCell-${i}`,{
    //     x: 0,
    //     y: i * (typeof rowHeight === 'number' ? rowHeight : 20),
    //     pickable: true,
    //     // display: 'flex',
    //     fill: rowSeriesNumberCellStyle.bgColor,
    //     stroke: rowSeriesNumberCellStyle.borderLine.stroke,
    //     lineWidth: rowSeriesNumberCellStyle.borderLine.lineWidth,
    //     width: this.rowSeriesNumberWidth,
    //     height: typeof rowHeight === 'number' ? rowHeight : 20
    //   },'group') as IGroup;
    //   cellGroup.id = i;
    //   cellGroup.states = rowSeriesNumberCellStyle.states;
    //   const text = cellGroup.createOrUpdateChild(`rowSeriesNumberCellText-${i}`,{
    //     x: 0,
    //     y: typeof rowHeight === 'number' ? rowHeight : 20,
    //     text: `${i + 1}`,
    //     pickable: false,
    //     ...rowSeriesNumberCellStyle.text
    //   },'text');
    // }
  }
  _renderFrozenLeftColSeriesNumber() {
    const {
      frozenColCount,
      rowCount,
      rowSeriesNumberWidth,
      colSeriesNumberHeight,
      rowSeriesNumberCellStyle,
      colSeriesNumberCellStyle,
      rowHeight,
      colWidth
    } = this.attribute;
    const frozenLeftSeriesNumberGroup = this._tableSeriesNumberContainer.createOrUpdateChild(
      'frozenLeftSeriesNumberGroup',
      {
        x: this.rowSeriesNumberWidth,
        y: 0,
        width: this.colSeriesNumberHeight,
        height: frozenColCount * (typeof colWidth === 'number' ? colWidth : 20)
      },
      'group'
    ) as IGroup;
    this._frozenLeftColSeriesNumberGroup = frozenLeftSeriesNumberGroup;
    // for (let i = 0; i < frozenColCount; i++) {
    //   const cellGroup = this._frozenLeftColSeriesNumberGroup.createOrUpdateChild(`colSeriesNumberCell-${i}`,{
    //     x: i * (typeof colWidth === 'number' ? colWidth : 20),
    //     y: 0,
    //     pickable: true,
    //     fill: colSeriesNumberCellStyle.bgColor,
    //     stroke: colSeriesNumberCellStyle.borderLine.stroke,
    //     lineWidth: colSeriesNumberCellStyle.borderLine.lineWidth,
    //     width: typeof colWidth === 'number' ? colWidth : 20,
    //     height: this.colSeriesNumberHeight
    //   },'group') as IGroup;
    //   cellGroup.id = i;
    //   cellGroup.states = colSeriesNumberCellStyle.states;
    //   const text = cellGroup.createOrUpdateChild(`colSeriesNumberCellText-${i}`,{
    //     x: 0,
    //     y: this.colSeriesNumberHeight,
    //     text: generateColField(i),
    //     pickable: false,
    //     ...colSeriesNumberCellStyle.text
    //   },'text');
    // }
  }

  recreateCellsToRowSeriesNumberGroup(startIndex: number, endIndex: number) {
    const {
      frozenRowCount,
      rowCount,
      colCount,
      rowSeriesNumberWidth,
      colSeriesNumberHeight,
      rowSeriesNumberCellStyle,
      colSeriesNumberCellStyle,
      rowHeight,
      colWidth
    } = this.attribute;
    this._frozenTopRowSeriesNumberGroup.removeAllChild();
    this._rowSeriesNumberGroup.removeAllChild();
    // #region 冻结行序号
    for (let i = 0; i < frozenRowCount; i++) {
      const cellGroup = this._frozenTopRowSeriesNumberGroup.createOrUpdateChild(
        `rowSeriesNumberCell-${i}`,
        {
          x: 0,
          y: 0,
          pickable: true,
          fill: rowSeriesNumberCellStyle.bgColor,
          stroke: rowSeriesNumberCellStyle.borderLine.stroke,
          lineWidth: rowSeriesNumberCellStyle.borderLine.lineWidth,
          width: this.rowSeriesNumberWidth,
          height: typeof rowHeight === 'number' ? rowHeight : 20
        },
        'group'
      ) as IGroup;
      cellGroup.id = i;
      cellGroup.states = rowSeriesNumberCellStyle.states;
      if (this.interactionState.selectIndexs?.has(cellGroup.name)) {
        cellGroup.useStates([SeriesNumberCellStateValue.select]);
      }
      const text = cellGroup.createOrUpdateChild(
        `rowSeriesNumberCellText-${i}`,
        {
          x: 0,
          y: typeof rowHeight === 'number' ? rowHeight : 20,
          text: `${i + 1}`,
          pickable: false,
          ...rowSeriesNumberCellStyle.text
        },
        'text'
      );
    }
    // #endregion
    this._firstRowSeriesNumberIndex = Math.max(startIndex, frozenRowCount) - frozenRowCount;
    let thisTextMaxWidth: number = 0;
    for (let i = this._firstRowSeriesNumberIndex; i <= endIndex - frozenRowCount; i++) {
      const cellGroup = this._rowSeriesNumberGroup.createOrUpdateChild(
        `rowSeriesNumberCell-${i + frozenRowCount}`,
        {
          x: 0,
          y: 0,
          pickable: true,
          fill: rowSeriesNumberCellStyle.bgColor,
          stroke: rowSeriesNumberCellStyle.borderLine.stroke,
          lineWidth: rowSeriesNumberCellStyle.borderLine.lineWidth,
          width: this.rowSeriesNumberWidth,
          height: typeof rowHeight === 'number' ? rowHeight : 20
        },
        'group'
      ) as IGroup;

      cellGroup.id = i + frozenRowCount;
      cellGroup.states = rowSeriesNumberCellStyle.states;
      //判断是否是当前选中的行号
      if (this.interactionState.selectIndexs?.has(cellGroup.name)) {
        cellGroup.useStates([SeriesNumberCellStateValue.select]);
      }
      const text = cellGroup.createOrUpdateChild(
        `rowSeriesNumberCellText-${i + frozenRowCount}`,
        {
          x: 0,
          y: typeof rowHeight === 'number' ? rowHeight : 20,
          boundsPadding: 4,
          text: `${i + 1 + frozenRowCount}`,
          pickable: false,
          ...rowSeriesNumberCellStyle.text
        },
        'text'
      );
      if (i === endIndex - frozenRowCount) {
        thisTextMaxWidth = (text as IText).clipedWidth;
      }
    }
    //对比新的宽和原来宽度差别大于1 则赋新值，并通知事件
    // 节流，防止频繁触发。频繁触发时，只取最后一次的值。
    clearTimeout(this._changeRowSeriesNumberWidthTimer);
    this._changeRowSeriesNumberWidthTimer = setTimeout(() => {
      if (Math.abs(thisTextMaxWidth - this._maxTextWidth) >= 6) {
        const oldWidth = this._maxTextWidth;
        this._maxTextWidth = thisTextMaxWidth;
        this.changeRowSeriesNumberWidth(Math.max(this.rowSeriesNumberWidth, 20));
        this._dispatchEvent(SeriesNumberEvent.rowSeriesNumberWidthChange, {
          newWidth: this.rowSeriesNumberWidth,
          oldWidth
        });
      }
    }, 100);
  }

  recreateCellsToColSeriesNumberGroup(startIndex: number, endIndex: number) {
    const { colCount, colSeriesNumberCellStyle, frozenColCount, colWidth } = this
      .attribute as TableSeriesNumberAttributes;
    this._frozenLeftColSeriesNumberGroup.removeAllChild();
    this._colSeriesNumberGroup.removeAllChild();
    // #region 冻结列序号
    for (let i = 0; i < frozenColCount; i++) {
      const cellGroup = this._frozenLeftColSeriesNumberGroup.createOrUpdateChild(
        `colSeriesNumberCell-${i}`,
        {
          x: i * (typeof colWidth === 'number' ? colWidth : 20),
          y: 0,
          pickable: true,
          fill: colSeriesNumberCellStyle.bgColor,
          stroke: colSeriesNumberCellStyle.borderLine.stroke,
          lineWidth: colSeriesNumberCellStyle.borderLine.lineWidth,
          width: typeof colWidth === 'number' ? colWidth : 20,
          height: this.colSeriesNumberHeight
        },
        'group'
      ) as IGroup;
      cellGroup.id = i;
      cellGroup.states = colSeriesNumberCellStyle.states;
      if (this.interactionState.selectIndexs?.has(cellGroup.name)) {
        cellGroup.useStates([SeriesNumberCellStateValue.select]);
      }
      const text = cellGroup.createOrUpdateChild(
        `colSeriesNumberCellText-${i}`,
        {
          x: 0,
          y: this.colSeriesNumberHeight,
          text: generateColField(i),
          pickable: false,
          ...colSeriesNumberCellStyle.text
        },
        'text'
      );
    }
    // #endregion

    this._firstColSeriesNumberIndex = Math.max(startIndex, frozenColCount) - frozenColCount;
    for (let i = this._firstColSeriesNumberIndex; i <= endIndex - frozenColCount; i++) {
      const cellGroup = this._colSeriesNumberGroup.createOrUpdateChild(
        `colSeriesNumberCell-${i + frozenColCount}`,
        {
          x: 0,
          y: 0,
          pickable: true,
          fill: colSeriesNumberCellStyle.bgColor,
          stroke: colSeriesNumberCellStyle.borderLine.stroke,
          lineWidth: colSeriesNumberCellStyle.borderLine.lineWidth,
          width: typeof colWidth === 'number' ? colWidth : 20,
          height: this.colSeriesNumberHeight
        },
        'group'
      ) as IGroup;
      cellGroup.id = i + frozenColCount;
      cellGroup.states = colSeriesNumberCellStyle.states;
      //判断是否是当前选中的列号
      if (this.interactionState.selectIndexs?.has(cellGroup.name)) {
        cellGroup.useStates([SeriesNumberCellStateValue.select]);
      }
      const text = cellGroup.createOrUpdateChild(
        `colSeriesNumberCellText-${i + frozenColCount}`,
        {
          x: 0,
          y: this.colSeriesNumberHeight,
          boundsPadding: 4,
          text: generateColField(i + frozenColCount),
          pickable: false,
          ...colSeriesNumberCellStyle.text
        },
        'text'
      );
    }
  }

  bindEvents() {
    //ff
    const { hover = true, select = true } = this.attribute;

    if (hover) {
      this._rowSeriesNumberGroup.addEventListener('pointermove', this._onHover as EventListenerOrEventListenerObject);
      this._rowSeriesNumberGroup.addEventListener(
        'pointerleave',
        this._onUnHover as EventListenerOrEventListenerObject
      );

      this._colSeriesNumberGroup.addEventListener('pointermove', this._onHover as EventListenerOrEventListenerObject);
      this._colSeriesNumberGroup.addEventListener(
        'pointerleave',
        this._onUnHover as EventListenerOrEventListenerObject
      );

      this._cornerGroup.addEventListener('pointermove', this._onHover as EventListenerOrEventListenerObject);
      this._cornerGroup.addEventListener('pointerleave', this._onUnHover as EventListenerOrEventListenerObject);

      this._frozenTopRowSeriesNumberGroup.addEventListener(
        'pointermove',
        this._onHover as EventListenerOrEventListenerObject
      );
      this._frozenTopRowSeriesNumberGroup.addEventListener(
        'pointerleave',
        this._onUnHover as EventListenerOrEventListenerObject
      );

      this._frozenLeftColSeriesNumberGroup.addEventListener(
        'pointermove',
        this._onHover as EventListenerOrEventListenerObject
      );
      this._frozenLeftColSeriesNumberGroup.addEventListener(
        'pointerleave',
        this._onUnHover as EventListenerOrEventListenerObject
      );
    }

    if (select) {
      this._rowSeriesNumberGroup.addEventListener('pointerdown', this._onClick as EventListenerOrEventListenerObject);
      this._colSeriesNumberGroup.addEventListener('pointerdown', this._onClick as EventListenerOrEventListenerObject);
      this._cornerGroup.addEventListener('pointerdown', this._onClick as EventListenerOrEventListenerObject);
      this._frozenTopRowSeriesNumberGroup.addEventListener(
        'pointerdown',
        this._onClick as EventListenerOrEventListenerObject
      );
      this._frozenLeftColSeriesNumberGroup.addEventListener(
        'pointerdown',
        this._onClick as EventListenerOrEventListenerObject
      );
    }
  }
  private _onHover = (e: FederatedPointerEvent) => {
    //ff
    const target = e.target as unknown as IGroup;
    // 如果上个激活元素存在，则判断当前元素是否和上个激活元素相同，相同则不做处理，不相同则触发 unhover
    if (this._lastHoverItem) {
      if (this._lastHoverItem.id === target.id) {
        return;
      }
      this._unHoverhandler(this._lastHoverItem, e);
    }
    this._hoverhandler(target, e);
  };
  private _onUnHover = (e: FederatedPointerEvent) => {
    //ff
    if (this._lastHoverItem) {
      this._unHoverhandler(this._lastHoverItem, e);
      this._lastHoverItem = null;
    }
  };
  private _onClick = (e: FederatedPointerEvent) => {
    //ff
    const target = e.target as unknown as IGroup;
    if (this.interactionState.selectIndexs?.size) {
      if (this.interactionState.selectIndexs.has(target.name)) {
        if (e.nativeEvent.ctrlKey || e.nativeEvent.metaKey) {
          this._unClickhandler(target.name, e);
        } else {
          for (const name of this.interactionState.selectIndexs) {
            this._unClickhandler(name, e);
          }
        }
      } else {
        if (e.nativeEvent.ctrlKey || e.nativeEvent.metaKey) {
          // nothing
        } else {
          for (const name of this.interactionState.selectIndexs) {
            this._unClickhandler(name, e);
          }
        }
      }
    }
    this._clickhandler(target, e);
  };

  private _hoverhandler(seriesNumberCell: IGroup, e: FederatedPointerEvent) {
    this._lastHoverItem = seriesNumberCell;
    //需兼顾select状态
    if (seriesNumberCell.hasState(SeriesNumberCellStateValue.select)) {
      seriesNumberCell.useStates([SeriesNumberCellStateValue.select, SeriesNumberCellStateValue.hover]);
    } else {
      seriesNumberCell.useStates([SeriesNumberCellStateValue.hover]);
    }

    this._dispatchEvent(SeriesNumberEvent.seriesNumberCellHover, { seriesNumberCell, event: e });
  }

  private _unHoverhandler(seriesNumberCell: IGroup, e: FederatedPointerEvent) {
    seriesNumberCell.removeState(SeriesNumberCellStateValue.hover);
    this._dispatchEvent(SeriesNumberEvent.seriesNumberCellUnHover, { seriesNumberCell, event: e });
  }

  private _clickhandler(seriesNumberCell: IGroup, e: FederatedPointerEvent) {
    this.interactionState.selectIndexs.add(seriesNumberCell.name);
    seriesNumberCell.useStates([SeriesNumberCellStateValue.select]);
    this._dispatchEvent(SeriesNumberEvent.seriesNumberCellClick, { seriesNumberCell, event: e });
  }
  private _unClickhandler(seriesNumberIndex: string, e: FederatedPointerEvent) {
    const isRow = seriesNumberIndex.startsWith('row');
    const isCol = seriesNumberIndex.startsWith('col');

    this.interactionState.selectIndexs.delete(seriesNumberIndex);

    const seriesNumberCell = isRow
      ? this.getRowSeriesNumberCellGroup(Number(seriesNumberIndex.split('-')[1]))
      : this.getColSeriesNumberCellGroup(Number(seriesNumberIndex.split('-')[1]));
    seriesNumberCell.removeState(SeriesNumberCellStateValue.select);
    this._dispatchEvent(SeriesNumberEvent.seriesNumberCellCancelClick, { seriesNumberCell, event: e });
  }

  changeRowSeriesNumberWidth(newWidth: number) {
    const {
      rowHeight,
      rowCount: oldRowCount,
      frozenRowCount,
      frozenColCount: frozenLeftCol,
      rowSeriesNumberCellStyle
    } = this.attribute as TableSeriesNumberAttributes;
    // 修改角头宽度
    this._cornerGroup.setAttributes({
      width: newWidth
    });

    //修改行序号冻结部分宽度
    this._frozenTopRowSeriesNumberGroup.setAttributes({
      width: newWidth
    });
    for (let i = 0; i < this._frozenTopRowSeriesNumberGroup.children.length; i++) {
      this.setRowSeriesNumberCellAttributes(i, {
        width: newWidth
      });
    }

    //修改行序号整体宽度
    this._rowSeriesNumberGroup.setAttributes({
      width: newWidth
    });
    for (let i = 0; i < this._rowSeriesNumberGroup.children.length; i++) {
      this.setRowSeriesNumberCellAttributes(i + this._firstRowSeriesNumberIndex + frozenRowCount, {
        width: newWidth
      });
    }

    // 修改列序号Group x坐标
    this._frozenLeftColSeriesNumberGroup.setAttributes({
      x: newWidth
    });
    // 修改列序号Group x坐标
    this._colSeriesNumberGroup.setAttributes({
      x: newWidth + this._frozenLeftColSeriesNumberGroup.getAttributes().width
    });
  }

  getRowSeriesNumberCellGroup(index: number) {
    const { frozenRowCount } = this.getAttributes() as TableSeriesNumberAttributes;
    if (index >= 0 && index < frozenRowCount) {
      return this._frozenTopRowSeriesNumberGroup.children[index];
    }
    const rowSeriesNumberGroup = this._rowSeriesNumberGroup;
    const rowSeriesNumberCell = rowSeriesNumberGroup.children[index - frozenRowCount - this._firstRowSeriesNumberIndex];
    return rowSeriesNumberCell;
  }
  getColSeriesNumberCellGroup(index: number) {
    const { frozenColCount } = this.getAttributes() as TableSeriesNumberAttributes;
    if (index >= 0 && index < frozenColCount) {
      return this._frozenLeftColSeriesNumberGroup.children[index];
    }
    const colSeriesNumberGroup = this._colSeriesNumberGroup;
    const colSeriesNumberCell = colSeriesNumberGroup.children[index - frozenColCount - this._firstColSeriesNumberIndex];
    return colSeriesNumberCell;
  }
  getRowSeriesNumberCellAttributes(index: number) {
    const { frozenRowCount } = this.getAttributes() as TableSeriesNumberAttributes;
    if (index >= 0 && index < frozenRowCount) {
      return this._frozenTopRowSeriesNumberGroup.children[index].attribute;
    }
    const rowSeriesNumberGroup = this._rowSeriesNumberGroup;
    const rowSeriesNumberCell = rowSeriesNumberGroup.children[index - frozenRowCount - this._firstRowSeriesNumberIndex];
    return rowSeriesNumberCell.attribute;
  }
  getColSeriesNumberCellAttributes(index: number) {
    const { frozenColCount } = this.getAttributes() as TableSeriesNumberAttributes;
    if (index >= 0 && index < frozenColCount) {
      return this._frozenLeftColSeriesNumberGroup.children[index].attribute;
    }
    const colSeriesNumberGroup = this._colSeriesNumberGroup;
    const colSeriesNumberCell = colSeriesNumberGroup.children[index - frozenColCount - this._firstColSeriesNumberIndex];
    return colSeriesNumberCell.attribute;
  }

  setRowSeriesNumberCellAttributes(index: number, attributes: TableSeriesNumberAttributes) {
    //找到rowSeriesNumberGroup中对应的子元素，并设置其属性
    const { frozenRowCount } = this.getAttributes() as TableSeriesNumberAttributes;
    if (index >= 0 && index < frozenRowCount) {
      const { height: oldHeight, width: oldWidth, y } = this._frozenTopRowSeriesNumberGroup.getAttributes();
      this._frozenTopRowSeriesNumberGroup.children[index].setAttributes(attributes);
      if (attributes.height) {
        this._frozenTopRowSeriesNumberGroup.setAttributes({
          height: this._frozenTopRowSeriesNumberGroup.getAttributes().height + (attributes.height - oldHeight)
        });
      }
      if (attributes.width) {
        this._frozenTopRowSeriesNumberGroup.setAttributes({
          width: this._frozenTopRowSeriesNumberGroup.getAttributes().width + (attributes.width - oldWidth)
        });
      }
      if (attributes.height) {
        this._rowSeriesNumberGroup.setAttributes({
          y:
            this._frozenTopRowSeriesNumberGroup.getAttributes().height +
            this._frozenTopRowSeriesNumberGroup.getAttributes().y
        });
      }

      return;
    }
    const rowSeriesNumberGroup = this._rowSeriesNumberGroup;
    const rowSeriesNumberCell = rowSeriesNumberGroup.children[index - frozenRowCount - this._firstRowSeriesNumberIndex];
    rowSeriesNumberCell.setAttributes(attributes);
  }
  setColSeriesNumberCellAttributes(index: number, attributes: TableSeriesNumberAttributes) {
    //找到colSeriesNumberGroup中对应的子元素，并设置其属性
    const { frozenColCount: frozenColCount } = this.getAttributes() as TableSeriesNumberAttributes;
    if (index >= 0 && index < frozenColCount) {
      const { height: oldHeight, width: oldWidth, x } = this._frozenLeftColSeriesNumberGroup.getAttributes();
      this._frozenLeftColSeriesNumberGroup.children[index].setAttributes(attributes);
      if (attributes.height) {
        this._frozenLeftColSeriesNumberGroup.setAttributes({
          height: this._frozenLeftColSeriesNumberGroup.getAttributes().height + (attributes.height - oldHeight)
        });
      }
      if (attributes.width) {
        this._frozenLeftColSeriesNumberGroup.setAttributes({
          width: this._frozenLeftColSeriesNumberGroup.getAttributes().width + (attributes.width - oldWidth)
        });
      }
      if (attributes.width) {
        this._colSeriesNumberGroup.setAttributes({
          x:
            this._frozenLeftColSeriesNumberGroup.getAttributes().width +
            this._frozenLeftColSeriesNumberGroup.getAttributes().x
        });
      }

      return;
    }
    const colSeriesNumberGroup = this._colSeriesNumberGroup;
    const colSeriesNumberCell = colSeriesNumberGroup.children[index - frozenColCount - this._firstColSeriesNumberIndex];
    colSeriesNumberCell.setAttributes(attributes);
  }
  setRowSeriesNumberGroupAttributes(attributes: TableSeriesNumberAttributes) {
    this._rowSeriesNumberGroup.setAttributes(attributes);
  }
  setColSeriesNumberGroupAttributes(attributes: TableSeriesNumberAttributes) {
    this._colSeriesNumberGroup.setAttributes(attributes);
  }
  addSelectedIndex(isRow: boolean, index: number) {
    let name: string;
    if (isRow) {
      name = `rowSeriesNumberCell-${index}`;
    } else {
      name = `colSeriesNumberCell-${index}`;
    }
    this.interactionState.selectIndexs.add(name);
  }
  addRowSelectedRanges(ranges: { startIndex: number; endIndex: number }[]) {
    const t0 = performance.now();
    for (let i = 0; i < ranges.length; i++) {
      const { startIndex, endIndex } = ranges[i];
      for (let j = startIndex; j <= endIndex; j++) {
        const name = `rowSeriesNumberCell-${j}`;
        this.interactionState.selectIndexs.add(name);
      }
    }
    const t1 = performance.now();
  }
  addColSelectedRanges(ranges: { startIndex: number; endIndex: number }[]) {
    for (let i = 0; i < ranges.length; i++) {
      const { startIndex, endIndex } = ranges[i];
      for (let j = startIndex; j <= endIndex; j++) {
        const name = `colSeriesNumberCell-${j}`;
        this.interactionState.selectIndexs.add(name);
      }
    }
  }
  resetAllSelectedIndexs({ rowIndexs, colIndexs }: { rowIndexs?: number[]; colIndexs?: number[] }) {
    this.interactionState.selectIndexs = new Set();
    if (rowIndexs) {
      for (let i = 0; i < rowIndexs.length; i++) {
        const name = `rowSeriesNumberCell-${rowIndexs[i]}`;
        this.interactionState.selectIndexs.add(name);
      }
    }
    if (colIndexs) {
      for (let i = 0; i < colIndexs.length; i++) {
        const name = `colSeriesNumberCell-${colIndexs[i]}`;
        this.interactionState.selectIndexs.add(name);
      }
    }
  }
  removeSelectedIndex(isRow: boolean, index: number) {
    let name: string;
    if (isRow) {
      name = `rowSeriesNumberLeftCell-${index}`;
    } else {
      name = `colSeriesNumberCell-${index}`;
    }
    this.interactionState.selectIndexs.delete(name);
  }
  removeAllSelectedIndexs() {
    for (const name of this.interactionState.selectIndexs) {
      const isRow = name.startsWith('row');
      const index = Number(name.split('-')[1]);
      if (isRow) {
        this.getRowSeriesNumberCellGroup(index)?.removeState(SeriesNumberCellStateValue.select);
      } else {
        this.getColSeriesNumberCellGroup(index)?.removeState(SeriesNumberCellStateValue.select);
      }
    }
    this.interactionState.selectIndexs.clear();
  }
  renderSelectedIndexsState() {
    const { rowSeriesNumberCellStyle, colSeriesNumberCellStyle } = this.attribute as TableSeriesNumberAttributes;
    for (const name of this.interactionState.selectIndexs) {
      const isRow = name.startsWith('row');
      const index = Number(name.split('-')[1]);
      if (isRow) {
        this.getRowSeriesNumberCellGroup(index)?.useStates([SeriesNumberCellStateValue.select]);
      } else {
        this.getColSeriesNumberCellGroup(index)?.useStates([SeriesNumberCellStateValue.select]);
      }
    }
  }
}
