import type {
  IAreaGraphicAttribute,
  ICurveType,
  IGroupGraphicAttribute,
  ILineGraphicAttribute,
  IRectGraphicAttribute,
  ISymbolGraphicAttribute
} from '@visactor/vrender-core';
import type { IPointLike } from '@visactor/vutils';
import type { OrientType } from '../interface';
import type { TagAttributes } from '../tag';

export interface DataZoomAttributes extends IGroupGraphicAttribute {
  /**
   * DataZoom位置
   */
  position: IPointLike;
  /**
   * DataZoom 尺寸
   */
  size: {
    width: number;
    height: number;
  };
  /**
   * DataZoom方向
   * @default 'bottom'
   */
  orient?: OrientType;

  /**
   * 起点配置（比例）：范围[0, 1]
   * @default 0
   */
  start?: number;

  /**
   * 终点配置（比例）：范围[0, 1]
   * @default 1
   */
  end?: number;

  /**
   * 背景样式
   */
  backgroundStyle?: IRectGraphicAttribute;

  /**
   * 起点手柄样式
   */
  startHandlerStyle?: ISymbolGraphicAttribute;

  /**
   * 中间手柄样式
   */
  middleHandlerStyle?: {
    /**
     * 是否显示
     * @default false
     */
    visible?: boolean;
    /**
     * 中间手柄的中间symbol样式
     */
    icon?: ISymbolGraphicAttribute;
    /**
     * 中间手柄的背景rect样式
     */
    background?: {
      style?: IRectGraphicAttribute;
      size?: number;
    };
  };

  /**
   * 终点手柄样式
   */
  endHandlerStyle?: ISymbolGraphicAttribute;

  /**
   * 起点文字样式
   */
  startTextStyle?: {
    formatMethod?: (text: string | number) => (string | number) | (string | number)[];
  } & Partial<TagAttributes>;

  /**
   * 终点文字样式
   */
  endTextStyle?: {
    formatMethod?: (text: string | number) => (string | number) | (string | number)[];
  } & Partial<TagAttributes>;

  /**
   * 选中背景样式
   */
  selectedBackgroundStyle?: IRectGraphicAttribute;

  /**
   * 拖拽进行中的选中背景样式
   */
  dragMaskStyle?: IRectGraphicAttribute;

  /**
   * 背景图表样式
   */
  backgroundChartStyle?: {
    line?: {
      visible?: boolean;
    } & ILineGraphicAttribute;
    area?: {
      /**
       * @default true
       */
      visible?: boolean;
      curveType?: ICurveType;
    } & Omit<IAreaGraphicAttribute, 'curveType'>;
  };

  /**
   * 选中的背景图表样式
   */
  selectedBackgroundChartStyle?: {
    line?: {
      /**
       * @default true
       */
      visible?: boolean;
    } & ILineGraphicAttribute;
    area?: {
      /**
       * @default true
       */
      visible?: boolean;
      curveType?: ICurveType;
    } & Omit<IAreaGraphicAttribute, 'curveType'>;
  };

  /**
   * 是否显示startText和endText
   * @default 'auto' 鼠标hover在选中区域时才显示startText和endText
   */
  showDetail?: 'auto' | boolean;

  /**
   * 是否开启框选, 如果不开启则支持selectedBackground拖拽（框选和拖拽两者互斥）
   * @default true
   */
  brushSelect?: boolean;

  /**
   * todo: 是否锁定选择区域（或叫做数据窗口）的大小
   */
  zoomLock?: boolean;

  /**
   * 绘制背景图表的数据 & 映射函数
   */
  previewData?: any[];
  previewCallbackX?: (datum: any) => number;
  previewCallbackY?: (datum: any) => number;
  previewCallbackX1?: (datum: any) => number;
  previewCallbackY1?: (datum: any) => number;
  updateStateCallback?: (start: number, end: number) => any;
  /**
   * 关闭交互效果
   * @default false
   */
  disableActiveEffect?: boolean;
}
