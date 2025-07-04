import type { TableSeriesNumber } from './table-series-number';
import { vglobal, type FederatedPointerEvent, type Group, type IGroup, type IText } from '@visactor/vrender-core';
import { SeriesNumberCellStateValue, SeriesNumberEvent } from './type';

export class TableSeriesNumberEventManager {
  private _tableSeriesNumber: TableSeriesNumber;
  isPointerDownStartSelect: boolean = false;
  constructor(tableSeriesNumber: TableSeriesNumber) {
    this._tableSeriesNumber = tableSeriesNumber;
  }

  bindEvents() {
    //ff
    const { hover = true, select = true } = this._tableSeriesNumber.attribute;

    if (hover) {
      this._tableSeriesNumber._rowSeriesNumberGroup.addEventListener(
        'pointermove',
        this._onPointermove as EventListenerOrEventListenerObject
      );
      this._tableSeriesNumber._rowSeriesNumberGroup.addEventListener(
        'pointerleave',
        this._onPointerleave as EventListenerOrEventListenerObject
      );

      this._tableSeriesNumber._colSeriesNumberGroup.addEventListener(
        'pointermove',
        this._onPointermove as EventListenerOrEventListenerObject
      );
      this._tableSeriesNumber._colSeriesNumberGroup.addEventListener(
        'pointerleave',
        this._onPointerleave as EventListenerOrEventListenerObject
      );

      this._tableSeriesNumber._cornerGroup.addEventListener(
        'pointermove',
        this._onPointermove as EventListenerOrEventListenerObject
      );
      this._tableSeriesNumber._cornerGroup.addEventListener(
        'pointerleave',
        this._onPointerleave as EventListenerOrEventListenerObject
      );

      this._tableSeriesNumber._frozenTopRowSeriesNumberGroup.addEventListener(
        'pointermove',
        this._onPointermove as EventListenerOrEventListenerObject
      );
      this._tableSeriesNumber._frozenTopRowSeriesNumberGroup.addEventListener(
        'pointerleave',
        this._onPointerleave as EventListenerOrEventListenerObject
      );

      this._tableSeriesNumber._frozenLeftColSeriesNumberGroup.addEventListener(
        'pointermove',
        this._onPointermove as EventListenerOrEventListenerObject
      );
      this._tableSeriesNumber._frozenLeftColSeriesNumberGroup.addEventListener(
        'pointerleave',
        this._onPointerleave as EventListenerOrEventListenerObject
      );
    }

    if (select) {
      this._tableSeriesNumber._rowSeriesNumberGroup.addEventListener(
        'pointerdown',
        this._onPointerdown as EventListenerOrEventListenerObject
      );
      this._tableSeriesNumber._colSeriesNumberGroup.addEventListener(
        'pointerdown',
        this._onPointerdown as EventListenerOrEventListenerObject
      );
      this._tableSeriesNumber._cornerGroup.addEventListener(
        'pointerdown',
        this._onPointerdown as EventListenerOrEventListenerObject
      );
      this._tableSeriesNumber._frozenTopRowSeriesNumberGroup.addEventListener(
        'pointerdown',
        this._onPointerdown as EventListenerOrEventListenerObject
      );
      this._tableSeriesNumber._frozenLeftColSeriesNumberGroup.addEventListener(
        'pointerdown',
        this._onPointerdown as EventListenerOrEventListenerObject
      );

      vglobal.addEventListener('pointerup', this._onPointerup as EventListenerOrEventListenerObject);
    }
  }
  private _onPointermove = (e: FederatedPointerEvent) => {
    //ff
    const target = e.target as unknown as IGroup;
    if (this.isPointerDownStartSelect) {
      if (!this._tableSeriesNumber.interactionState.selectIndexs.has(target.name)) {
        this._tableSeriesNumber.interactionState.selectIndexs.add(target.name);
        this._tableSeriesNumber.renderSelectedIndexsState();
        this._tableSeriesNumber.dispatchTableSeriesNumberEvent(SeriesNumberEvent.seriesNumberCellClick, {
          seriesNumberCell: target,
          event: e,
          isDragSelect: true
        });
      } else {
        if (
          this._tableSeriesNumber.interactionState._lastClickItem &&
          this._tableSeriesNumber.interactionState._lastClickItem.id === target.id
        ) {
          return;
        }
        this._tableSeriesNumber.renderSelectedIndexsState();
        this._tableSeriesNumber.dispatchTableSeriesNumberEvent(SeriesNumberEvent.seriesNumberCellClick, {
          seriesNumberCell: target,
          event: e,
          isDragSelect: true
        });
      }
      this._tableSeriesNumber.interactionState._lastClickItem = target;
      return;
    }

    if (target.name.startsWith('col')) {
      //判断鼠标是否位于列间隔线附近，如果是则设置cursor为col-resize
      const colIndex = Number(target.name.split('-')[1]);
      const canvasPointXY = target.stage.window.pointTransform(e.canvasX, e.canvasY);
      const XYtoTarget = { x: 0, y: 0 };

      target.globalTransMatrix.transformPoint(canvasPointXY, XYtoTarget);
      if (
        XYtoTarget.x <= 4 ||
        (XYtoTarget.x <= target.getAttributes().width && XYtoTarget.x >= target.getAttributes().width - 4)
      ) {
        target.setAttribute('cursor', 'col-resize');
      } else {
        target.setAttribute('cursor', 'default');
      }
    } else if (target.name.startsWith('row')) {
      //判断鼠标是否位于行间隔线附近，如果是则设置cursor为row-resize
      const rowIndex = Number(target.name.split('-')[1]);
      const canvasPointXY = target.stage.window.pointTransform(e.canvasX, e.canvasY);
      const XYtoTarget = { x: 0, y: 0 };

      target.globalTransMatrix.transformPoint(canvasPointXY, XYtoTarget);
      if (
        XYtoTarget.y <= 4 ||
        (XYtoTarget.y <= target.getAttributes().height && XYtoTarget.y >= target.getAttributes().height - 4)
      ) {
        target.setAttribute('cursor', 'row-resize');
      } else {
        target.setAttribute('cursor', 'default');
      }
    }
    // // 如果上个激活元素存在，则判断当前元素是否和上个激活元素相同，相同则不做处理，不相同则触发 unhover
    if (this._tableSeriesNumber.interactionState._lastHoverItem) {
      if (this._tableSeriesNumber.interactionState._lastHoverItem.id === target.id) {
        return;
      }
      this._unHoverHandler(this._tableSeriesNumber.interactionState._lastHoverItem, e);
    }
    if ((this._tableSeriesNumber.getAttributes() as any).hover) {
      this._hoverHandler(target, e);
    }
  };
  private _onPointerleave = (e: FederatedPointerEvent) => {
    //ff
    if (this._tableSeriesNumber.interactionState._lastHoverItem) {
      this._unHoverHandler(this._tableSeriesNumber.interactionState._lastHoverItem, e);
      this._tableSeriesNumber.interactionState._lastHoverItem = null;
    }
  };
  private _onPointerdown = (e: FederatedPointerEvent) => {
    //ff
    const target = e.target as unknown as IGroup;

    if (target.name.startsWith('col')) {
      //判断鼠标是否位于列间隔线附近，如果是则触发resizeColWidthStart事件
      const colIndex = Number(target.name.split('-')[1]);
      const canvasPointXY = target.stage.window.pointTransform(e.canvasX, e.canvasY);
      const XYtoTarget = { x: 0, y: 0 };

      target.globalTransMatrix.transformPoint(canvasPointXY, XYtoTarget);
      if (
        XYtoTarget.x <= 4 ||
        (XYtoTarget.x <= target.getAttributes().width && XYtoTarget.x >= target.getAttributes().width - 4)
      ) {
        let resizeTargetColIndex = colIndex;
        if (XYtoTarget.x <= 4) {
          resizeTargetColIndex = colIndex - 1;
        }
        this._tableSeriesNumber.dispatchTableSeriesNumberEvent(SeriesNumberEvent.resizeColWidthStart, {
          colIndex: resizeTargetColIndex,
          event: e
        });
        return;
      }
    } else if (target.name.startsWith('row')) {
      //判断鼠标是否位于行间隔线附近，如果是则触发resizeRowHeightStart事件
      const rowIndex = Number(target.name.split('-')[1]);
      const canvasPointXY = target.stage.window.pointTransform(e.canvasX, e.canvasY);
      const XYtoTarget = { x: 0, y: 0 };

      target.globalTransMatrix.transformPoint(canvasPointXY, XYtoTarget);
      if (
        XYtoTarget.y <= 4 ||
        (XYtoTarget.y <= target.getAttributes().height && XYtoTarget.y >= target.getAttributes().height - 4)
      ) {
        let resizeTargetRowIndex = rowIndex;
        if (XYtoTarget.y <= 4) {
          resizeTargetRowIndex = rowIndex - 1;
        }
        this._tableSeriesNumber.dispatchTableSeriesNumberEvent(SeriesNumberEvent.resizeRowHeightStart, {
          rowIndex: resizeTargetRowIndex,
          event: e
        });
        return;
      }
    }
    this.isPointerDownStartSelect = true;
    if (this._tableSeriesNumber.interactionState.selectIndexs?.size) {
      if (this._tableSeriesNumber.interactionState.selectIndexs.has(target.name)) {
        if (e.nativeEvent.ctrlKey || e.nativeEvent.metaKey) {
          this._tableSeriesNumber.removeOneGroupSelected(target);
          this._unClickHandler(target.name, e);
        } else {
          this._tableSeriesNumber.removeAllSelectedIndexs();
          for (const name of this._tableSeriesNumber.interactionState.selectIndexs) {
            this._unClickHandler(name, e);
          }
        }
      } else {
        if (e.nativeEvent.ctrlKey || e.nativeEvent.metaKey) {
          // nothing
        } else {
          this._tableSeriesNumber.removeAllSelectedIndexs();
          for (const name of this._tableSeriesNumber.interactionState.selectIndexs) {
            if (
              (target.name.startsWith('row') && name.startsWith('row')) ||
              (target.name.startsWith('col') && name.startsWith('col'))
            ) {
              this._unClickHandler(name, e);
            }
          }
        }
      }
    }
    this._clickHandler(target, e);
  };
  private _onPointerup = (e: FederatedPointerEvent) => {
    //ff
    const target = e.target as unknown as IGroup;
    if (this.isPointerDownStartSelect) {
      this.isPointerDownStartSelect = false;
      this._tableSeriesNumber.interactionState._lastClickItem = null;
      this._tableSeriesNumber.dispatchTableSeriesNumberEvent(SeriesNumberEvent.seriesNumberCellClickUp, {
        seriesNumberCell: target,
        event: e
      });
    }
  };

  private _hoverHandler(seriesNumberCell: IGroup, e: FederatedPointerEvent) {
    this._tableSeriesNumber.interactionState._lastHoverItem = seriesNumberCell;
    //需兼顾select状态
    if (seriesNumberCell.hasState(SeriesNumberCellStateValue.select)) {
      seriesNumberCell.useStates([SeriesNumberCellStateValue.select, SeriesNumberCellStateValue.hover]);
    } else {
      seriesNumberCell.useStates([SeriesNumberCellStateValue.hover]);
    }

    this._tableSeriesNumber.dispatchTableSeriesNumberEvent(SeriesNumberEvent.seriesNumberCellHover, {
      seriesNumberCell,
      event: e
    });
  }

  private _unHoverHandler(seriesNumberCell: IGroup, e: FederatedPointerEvent) {
    seriesNumberCell.removeState(SeriesNumberCellStateValue.hover);
    this._tableSeriesNumber.dispatchTableSeriesNumberEvent(SeriesNumberEvent.seriesNumberCellUnHover, {
      seriesNumberCell,
      event: e
    });
  }

  private _clickHandler(seriesNumberCell: IGroup, e: FederatedPointerEvent) {
    // this._tableSeriesNumber.interactionState.selectIndexs.add(seriesNumberCell.name);
    // seriesNumberCell.useStates([SeriesNumberCellStateValue.select]);
    this._tableSeriesNumber.addOneGroupSelected(seriesNumberCell);
    this._tableSeriesNumber.interactionState._lastClickItem = seriesNumberCell;
    this._tableSeriesNumber.dispatchTableSeriesNumberEvent(SeriesNumberEvent.seriesNumberCellClick, {
      seriesNumberCell,
      event: e
    });
  }
  private _unClickHandler(seriesNumberIndex: string, e: FederatedPointerEvent) {
    const isRow = seriesNumberIndex.startsWith('row');
    // const isCol = seriesNumberIndex.startsWith('col');

    // this._tableSeriesNumber.interactionState.selectIndexs.delete(seriesNumberIndex);
    // this._tableSeriesNumber.removeOneGroupSelected(seriesNumberIndex);
    const seriesNumberCell = isRow
      ? this._tableSeriesNumber.getRowSeriesNumberCellGroup(Number(seriesNumberIndex.split('-')[1]))
      : this._tableSeriesNumber.getColSeriesNumberCellGroup(Number(seriesNumberIndex.split('-')[1]));
    seriesNumberCell?.removeState(SeriesNumberCellStateValue.select);
    this._tableSeriesNumber.dispatchTableSeriesNumberEvent(SeriesNumberEvent.seriesNumberCellCancelClick, {
      index: seriesNumberIndex,
      event: e
    });
  }
}
