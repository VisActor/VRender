import type {
  IAreaGraphicAttribute,
  ICurveType,
  IGroupGraphicAttribute,
  ILineGraphicAttribute,
  IRectGraphicAttribute,
  ISymbolGraphicAttribute
} from '@visactor/vrender-core';
import type { IPointLike } from '@visactor/vutils';
import type { IDelayType, OrientType } from '../interface';
import type { TagAttributes } from '../tag/type';

export enum DataZoomActiveTag {
  startHandler = 'startHandler',
  endHandler = 'endHandler',
  middleHandler = 'middleHandler',
  background = 'background'
}

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
  startHandlerStyle?: {
    /**
     * 热区最小size
     * 取handler size 和 min size 的最大值
     */
    triggerMinSize?: number;
  } & ISymbolGraphicAttribute;

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
  endHandlerStyle?: {
    /**
     * 热区最小size
     * 取handler size 和 min size 的最大值
     */
    triggerMinSize?: number;
  } & ISymbolGraphicAttribute;

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
   * 是否锁定选择区域（或叫做数据窗口）的大小
   */
  zoomLock?: boolean;

  /**
   * 用于限制窗口大小的最小值, [0, 1]
   * @default 0
   */
  minSpan?: number;

  /**
   * 用于限制窗口大小的最大值, [0, 1]
   * @default 1
   */
  maxSpan?: number;

  /**
   * 事件触发延迟类型
   * @default 'throttle'
   */
  delayType?: IDelayType;

  /**
   * 事件触发延迟时长
   * @default 0
   */
  delayTime?: number;
  /**
   * 是否在操作时动态更新视图
   * @default true
   */
  realTime?: boolean;

  /**
   * 绘制背景图表的数据 & 映射函数
   */
  previewData?: any[];
  previewPointsX?: (datum: any) => number;
  previewPointsY?: (datum: any) => number;
  previewPointsX1?: (datum: any) => number;
  previewPointsY1?: (datum: any) => number;
  updateStateCallback?: (start: number, end: number) => any;
  /**
   * 关闭交互效果
   * @default false
   */
  disableTriggerEvent?: boolean;
  /**
   * 背景图表数据点采样压缩率
   * 参考: https://mourner.github.io/simplify-js/
   */
  tolerance?: number;
}
