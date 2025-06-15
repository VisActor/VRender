import type { Dict } from '@visactor/vutils';
import { isValid, merge, normalizePadding } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { TableSeriesNumberAttributes } from './type';
import type { FederatedPointerEvent, Group, IGroup } from '@visactor/vrender-core';
import { Image, Rect, Text, graphicCreator } from '@visactor/vrender-core';
import type { ComponentOptions } from '../interface';
import { loadTableSeriesNumberComponent } from './register';
export enum SeriesNumberCellStateValue {
  hover = 'hover',
  select = 'select'
}
export enum SeriesNumberEvent {
  seriesNumberCellHover = 'seriesNumberCellHover',
  seriesNumberCellUnHover = 'seriesNumberCellUnHover',
  seriesNumberCellClick = 'seriesNumberCellClick'
}
const cornerSvg =
  '<svg t="1716726614852" class="icon" viewBox="0 0 1194 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2621" width="200" height="200"><path d="M1038.694079 367.237067c13.265507 23.342857-16.633865-40.004445-63.05621-40.004446H219.018794c-26.558738 0-46.46393 13.334815-63.05621 40.004446S0.006238 607.277601 0.006238 650.608819V940.647979a82.351494 82.351494 0 0 0 82.961402 83.349526H1111.702885a82.337632 82.337632 0 0 0 82.975264-83.349526V650.608819c0-43.331218-155.970208-283.371753-155.970208-283.371752zM730.066575 667.284269a136.328386 136.328386 0 0 1-132.738243 133.33429 133.417459 133.417459 0 0 1-132.738243-133.33429v-6.681269a40.6698 40.6698 0 0 0-36.497473-26.66963H73.015044l119.458874-220.02445s23.231965-40.004445 53.103614-40.004446h713.481918c26.544876 0 29.871649 10.008042 46.436207 40.004446L1128.33675 633.947231H769.904682c-26.184476 0-39.838107 7.623855-39.838107 33.337038zM338.505391 210.559919l-89.601086-86.69016a22.178487 22.178487 0 0 1 0-33.26773 21.984425 21.984425 0 0 1 33.170699 0l89.601087 86.676299a22.317102 22.317102 0 0 1 0 33.26773 24.950798 24.950798 0 0 1-33.1707 0z m252.197118-40.059891a25.532983 25.532983 0 0 1-6.639685-16.633865l-3.326773-126.694606A28.263709 28.263709 0 0 1 603.995739 0.515788c13.251646-3.326773 23.204242 10.021904 26.544877 23.342858V153.866163a28.249847 28.249847 0 0 1-23.259688 26.66963c-6.611961-3.312911-13.279369-3.312911-16.578419-10.035765z m235.646421 33.337038a22.372548 22.372548 0 0 1 0-33.337038l86.288175-90.030795a22.039871 22.039871 0 0 1 33.170699 0 22.289379 22.289379 0 0 1 0 33.364761l-82.961401 90.003072a25.962691 25.962691 0 0 1-36.483611 0z" fill="#8a8a8a" p-id="2622"></path></svg>';

loadTableSeriesNumberComponent();
export class TableSeriesNumber extends AbstractComponent<Required<TableSeriesNumberAttributes>> {
  static defaultAttributes: Partial<TableSeriesNumberAttributes> = {
    rowCount: 100,
    columnCount: 100,
    rowSeriesNumberWidth: 'auto',
    columnSeriesNumberHeight: 'auto',
    rowSeriesNumberCellStyle: {
      text: {
        fontSize: 14,
        fill: '#000',
        pickable: false
      },
      borderLine: {
        stroke: '#000',
        lineWidth: 1,
        pickable: false
      },
      states: {
        hover: {
          fill: 'gray',
          opacity: 0.7
        },
        select: {
          fill: 'gray',
          opacity: 0.7
        }
      }
    },
    columnSeriesNumberCellStyle: {
      text: {
        fontSize: 14,
        fill: '#000',
        pickable: false
      },
      borderLine: {
        stroke: '#000',
        lineWidth: 1,
        pickable: false
      },
      states: {
        hover: {
          fill: 'gray',
          opacity: 0.7
        },
        select: {
          fill: 'gray',
          opacity: 0.7
        }
      }
    },
    cornerCellStyle: {
      borderLine: {
        stroke: '#000',
        lineWidth: 1,
        pickable: false
      },
      states: {
        hover: {
          fill: 'gray',
          opacity: 0.7
        },
        select: {
          fill: 'gray',
          opacity: 0.7
        }
      }
    }
  };
  name = 'legend';
  protected _innerView!: IGroup;
  // protected _title: Tag | null = null;
  _cornerGroup: IGroup;
  _rowSeriesNumberGroup: IGroup;
  _columnSeriesNumberGroup: IGroup;
  _lastActiveItem: IGroup;
  constructor(attributes: TableSeriesNumberAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, TableSeriesNumber.defaultAttributes, attributes));
    this.render();
  }

  render() {
    this.removeAllChild(true);
    const {
      rowCount,
      columnCount,
      rowSeriesNumberWidth,
      columnSeriesNumberHeight,
      rowSeriesNumberCellStyle,
      columnSeriesNumberCellStyle,
      rowHeight,
      columnWidth
    } = this.attribute;
    // 创建一个内部的 container 用于存储所有的元素
    const innerView = graphicCreator.group({
      x: 0,
      y: 0,
      fill: 'gray',
      width:
        (typeof rowSeriesNumberWidth === 'number' ? rowSeriesNumberWidth : 20) +
        columnCount * (typeof columnWidth === 'number' ? columnWidth : 20),
      height:
        (typeof columnSeriesNumberHeight === 'number' ? columnSeriesNumberHeight : 20) +
        rowCount * (typeof rowHeight === 'number' ? rowHeight : 20),
      pickable: true,
      childrenPickable: true
    });
    // innerView.name = LEGEND_ELEMENT_NAME.innerView;
    this.add(innerView);
    this._innerView = innerView;

    this._renderContent();

    this._adjustLayout();

    this._bindEvents();
  }
  _renderContent() {
    this._renderCorner();
    this._renderRowSeriesNumber();
    this._renderColumnSeriesNumber();
  }
  _renderCorner() {
    const {
      rowCount,
      columnCount,
      cornerCellStyle: cornerSeriesNumberCellStyle,
      rowSeriesNumberWidth,
      columnSeriesNumberHeight,
      rowSeriesNumberCellStyle,
      columnSeriesNumberCellStyle,
      rowHeight,
      columnWidth
    } = this.attribute;
    // 组织角头
    const cornerGroup = graphicCreator.group({
      x: 0,
      y: 0,
      fill: 'yellow',
      pickable: true,
      width: typeof rowSeriesNumberWidth === 'number' ? rowSeriesNumberWidth : 20,
      height: typeof columnSeriesNumberHeight === 'number' ? columnSeriesNumberHeight : 20
    });
    cornerGroup.name = `conerSeriesNumberCell`;
    cornerGroup.id = '0,0';
    cornerGroup.states = cornerSeriesNumberCellStyle.states;
    this._innerView.add(cornerGroup);
    this._cornerGroup = cornerGroup;
  }
  _renderRowSeriesNumber() {
    const {
      rowCount,
      columnCount,
      rowSeriesNumberWidth,
      columnSeriesNumberHeight,
      rowSeriesNumberCellStyle,
      columnSeriesNumberCellStyle,
      rowHeight,
      columnWidth
    } = this.attribute;

    //组织行号Group
    const rowSeriesNumberGroup = graphicCreator.group({
      x: 0,
      y: typeof rowSeriesNumberWidth === 'number' ? rowSeriesNumberWidth : 20,
      pickable: true,
      fill: 'pink',
      width: typeof rowSeriesNumberWidth === 'number' ? rowSeriesNumberWidth : 20,
      height: rowCount * (typeof rowHeight === 'number' ? rowHeight : 20)
    });
    this._innerView.add(rowSeriesNumberGroup);
    this._rowSeriesNumberGroup = rowSeriesNumberGroup;
    //组织每个行号单元格
    for (let i = 0; i < rowCount; i++) {
      const cellGroup = graphicCreator.group({
        x: 0,
        y: i * (typeof rowHeight === 'number' ? rowHeight : 20),
        pickable: true,
        stroke: 'green',
        width: typeof rowSeriesNumberWidth === 'number' ? rowSeriesNumberWidth : 20,
        height: typeof rowHeight === 'number' ? rowHeight : 20
      });
      cellGroup.name = `rowSeriesNumberCell-${i}`;
      cellGroup.id = i;
      cellGroup.states = rowSeriesNumberCellStyle.states;
      rowSeriesNumberGroup.add(cellGroup);

      const text = graphicCreator.text({
        x: 0,
        y: typeof rowHeight === 'number' ? rowHeight : 20,
        text: `${i + 1}`,
        pickable: false,
        ...rowSeriesNumberCellStyle.text
      });
      cellGroup.add(text);
    }
  }
  _renderColumnSeriesNumber() {
    const {
      rowCount,
      columnCount,
      rowSeriesNumberWidth,
      columnSeriesNumberHeight,
      rowSeriesNumberCellStyle,
      columnSeriesNumberCellStyle,
      rowHeight,
      columnWidth
    } = this.attribute;
    //组织列号Group
    const columnSeriesNumberGroup = graphicCreator.group({
      x: typeof rowSeriesNumberWidth === 'number' ? rowSeriesNumberWidth : 20,
      y: 0,
      pickable: true,
      fill: 'red',
      width: columnCount * (typeof columnWidth === 'number' ? columnWidth : 20),
      height: typeof columnSeriesNumberHeight === 'number' ? columnSeriesNumberHeight : 20
    });
    this._innerView.add(columnSeriesNumberGroup);
    this._columnSeriesNumberGroup = columnSeriesNumberGroup;
    //组织每个列号单元格
    for (let i = 0; i < columnCount; i++) {
      const cellGroup = graphicCreator.group({
        x: i * (typeof columnWidth === 'number' ? columnWidth : 20),
        y: 0,
        pickable: true,
        stroke: 'green',
        width: typeof columnWidth === 'number' ? columnWidth : 20,
        height: typeof columnSeriesNumberHeight === 'number' ? columnSeriesNumberHeight : 20
      });
      cellGroup.name = `columnSeriesNumberCell-${i}`;
      cellGroup.id = i;
      columnSeriesNumberGroup.add(cellGroup);
      const text = graphicCreator.text({
        x: 0,
        y: typeof columnSeriesNumberHeight === 'number' ? columnSeriesNumberHeight : 20,
        text: this.generateColumnField(i),
        pickable: false,
        ...columnSeriesNumberCellStyle.text
      });
      cellGroup.add(text);
      cellGroup.states = columnSeriesNumberCellStyle.states;
    }
  }
  _adjustLayout() {
    //ff
  }
  _bindEvents() {
    //ff
    const { hover = true, select = true } = this.attribute;

    if (hover) {
      const trigger = 'pointermove';
      const triggerOff = 'pointerleave';

      // if (isObject(hover)) {
      //   hover.trigger && (trigger = hover.trigger);
      //   hover.triggerOff && (triggerOff = hover.triggerOff);
      // }

      this._rowSeriesNumberGroup.addEventListener(trigger, this._onHover as EventListenerOrEventListenerObject);
      this._rowSeriesNumberGroup.addEventListener(triggerOff, this._onUnHover as EventListenerOrEventListenerObject);
      this._columnSeriesNumberGroup.addEventListener(trigger, this._onHover as EventListenerOrEventListenerObject);
      this._columnSeriesNumberGroup.addEventListener(triggerOff, this._onUnHover as EventListenerOrEventListenerObject);
      this._cornerGroup.addEventListener(trigger, this._onHover as EventListenerOrEventListenerObject);
      this._cornerGroup.addEventListener(triggerOff, this._onUnHover as EventListenerOrEventListenerObject);
    }

    if (select) {
      const trigger = 'pointerdown';
      // if (isObject(select) && select.trigger) {
      //   trigger = select.trigger;
      // }
      this._columnSeriesNumberGroup.addEventListener(trigger, this._onClick as EventListenerOrEventListenerObject);
    }
  }
  private _onHover = (e: FederatedPointerEvent) => {
    //ff
    const target = e.target as unknown as IGroup;
    // 如果上个激活元素存在，则判断当前元素是否和上个激活元素相同，相同则不做处理，不相同则触发 unhover
    if (this._lastActiveItem) {
      if (this._lastActiveItem.id === target.id) {
        return;
      }
      this._unHover(this._lastActiveItem, e);
    }
    this._hover(target, e);
  };
  private _onUnHover = (e: FederatedPointerEvent) => {
    //ff
    if (this._lastActiveItem) {
      this._unHover(this._lastActiveItem, e);
      this._lastActiveItem = null;
    }
  };
  private _onClick = (e: FederatedPointerEvent) => {
    //ff
    const target = e.target;
  };

  _hover(seriesNumberCell: IGroup, e: FederatedPointerEvent) {
    this._lastActiveItem = seriesNumberCell;
    const hover = seriesNumberCell.useStates([SeriesNumberCellStateValue.hover]);

    this._dispatchEvent(SeriesNumberEvent.seriesNumberCellHover, { seriesNumberCell, event: e });
  }

  private _unHover(seriesNumberCell: IGroup, e: FederatedPointerEvent) {
    seriesNumberCell.removeState(SeriesNumberCellStateValue.hover);
    this._dispatchEvent(SeriesNumberEvent.seriesNumberCellHover, { seriesNumberCell, event: e });
  }

  /**
   * 生成excel的列标题，规则和excel一致，如A~Z,AA~AZ,AB~AZ,AA~ZZ,AAA~ZZZ
   * @param index 从0开始
   * @returns
   */
  generateColumnField(index: number): string {
    // 处理0-25的情况（A-Z）
    if (index < 26) {
      return String.fromCharCode(65 + index);
    }

    const title = [];
    index++; // 调整索引，使得第一个26变成AA

    while (index > 0) {
      index--; // 每次循环前减1，以正确处理进位
      title.unshift(String.fromCharCode(65 + (index % 26)));
      index = Math.floor(index / 26);
    }

    return title.join('');
  }
}
