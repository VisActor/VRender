import type {
  IColor,
  IGroupGraphicAttribute,
  IImageGraphicAttribute,
  ILineGraphicAttribute,
  ITextGraphicAttribute
} from '@visactor/vrender-core';

// export type EmptyTipIcon = IImageGraphicAttribute;
export enum SeriesNumberCellStateValue {
  hover = 'hover',
  select = 'select'
}
export enum SeriesNumberEvent {
  seriesNumberCellHover = 'seriesNumberCellHover',
  seriesNumberCellUnHover = 'seriesNumberCellUnHover',
  seriesNumberCellClick = 'seriesNumberCellClick',
  seriesNumberCellCancelClick = 'seriesNumberCellCancelClick',
  rowSeriesNumberWidthChange = 'rowSeriesNumberWidthChange',

  /** 调整行高开始 */
  resizeRowHeightStart = 'resizeRowHeightStart',

  /** 调整列宽开始 */
  resizeColWidthStart = 'resizeColWidthStart'
}
export type TableSeriesNumberAttributes = IGroupGraphicAttribute & {
  frozenRowCount?: number;
  frozenColCount?: number;
  rightFrozenColCount?: number;
  bottomFrozenRowCount?: number;
  rowSeriesNumberGenerate?: (index: number) => string;
  rowSeriesNumberWidth?: number | 'auto';
  rowHeight?: number | 'auto';
  rowCount?: number;
  rowSeriesNumberCellStyle?: {
    text?: ITextGraphicAttribute & { padding?: number | number[] };
    borderLine?: ILineGraphicAttribute;
    bgColor?: IColor;
    states?: {
      hover: {
        fill: IColor;
        opacity: number;
      };
      select?: {
        fill: IColor;
        opacity: number;
      };
    };
  };
  colSeriesNumberGenerate?: (index: number) => string;
  colSeriesNumberHeight?: number | 'auto';
  colWidth?: number | 'auto';
  colSeriesNumberCellStyle?: {
    text?: ITextGraphicAttribute & { padding?: number | number[] };
    borderLine?: ILineGraphicAttribute;
    bgColor?: IColor;
    states?: {
      hover: {
        fill: IColor;
        opacity: number;
      };
      select?: {
        fill: IColor;
        opacity: number;
      };
    };
  };
  colCount?: number;
  cornerCellStyle?: {
    borderLine?: ILineGraphicAttribute;
    bgColor?: IColor;
    states?: {
      hover: {
        fill: IColor;
        opacity: number;
      };
      select?: {
        fill: IColor;
        opacity: number;
      };
    };
  };
  /**
   * 是否开启选中交互
   */
  select?: boolean;
  // | {
  //     /**
  //      * 触发选中交互的事件类型
  //      * @since 0.20.13
  //      **/
  //     trigger?: GraphicEventType;
  //   };

  /**
   * 是否开启 hover 交互
   */
  hover?: boolean;
  // | {
  //     /**
  //      * 触发hover交互的事件类型
  //      * @since 0.20.13
  //      **/
  //     trigger?: GraphicEventType;
  //     /**
  //      * 触发取消hover交互的事件类型
  //      * @since 0.20.13
  //      **/
  //     triggerOff?: GraphicEventType;
  //   };
};
