import type {
  IColor,
  IGroupGraphicAttribute,
  IImageGraphicAttribute,
  ILineGraphicAttribute,
  ITextGraphicAttribute
} from '@visactor/vrender-core';
// export type ColumnSeriesNumberAttributes = IGroupGraphicAttribute ;

// export type EmptyTipIcon = IImageGraphicAttribute;

export type TableSeriesNumberAttributes = IGroupGraphicAttribute & {
  rowSeriesNumberGenerate?: (index: number) => string;
  rowSeriesNumberWidth?: number | 'auto';
  rowHeight?: number | 'auto';
  rowCount?: number;
  rowSeriesNumberCellStyle?: {
    text?: ITextGraphicAttribute;
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
  columnSeriesNumberGenerate?: (index: number) => string;
  columnSeriesNumberHeight?: number | 'auto';
  columnWidth?: number | 'auto';
  columnSeriesNumberCellStyle?: {
    text?: ITextGraphicAttribute;
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
  columnCount?: number;
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
