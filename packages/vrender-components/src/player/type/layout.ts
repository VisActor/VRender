import type { IRectGraphicAttribute, ISymbolGraphicAttribute } from '@visactor/vrender';
import type { OrientType } from '../../interface';
import type { BaseGraphicAttributes } from '../../core/type';
import type { ControllerTypeEnum } from '../controller/constant';

export type BasePlayerLayoutAttributes = {
  /**
   * 组件位置
   * @default 'bottom'
   */
  orient?: OrientType;

  /**
   * 组件尺寸
   * @TODO 这玩意各个组件应该是通用的, 可以抽出去复用.
   */
  size: {
    /**
     * 组件宽度
     */
    width: number;
    /**
     * 组件高度
     */
    height: number;
  };

  /**
   * 滑轨样式
   */
  slider?: {
    /**
     * @default true
     */
    visible?: boolean;
    space?: number;
    dx?: number;
    dy?: number;
    railStyle?: RailStyleType; // 轨道
    trackStyle?: TrackStyleType; // 轨迹
    handlerStyle?: HandlerStyleType; // 手柄
  };

  /**
   * 控制器
   */
  controller?: {
    start?: ControllerType;
    pause?: ControllerType;
    forward?: ControllerType;
    backward?: ControllerType;
  };
};

export type RailStyleType = Partial<IRectGraphicAttribute>;
export type TrackStyleType = Partial<IRectGraphicAttribute>;
export type HandlerStyleType = Partial<ISymbolGraphicAttribute>;

export type ControllerLayout = {
  key?: ControllerTypeEnum;
  /**
   * 当前元素与前一个元素的间隔
   */
  space?: number;
  /**
   * 指定按钮顺序的数值
   */
  order?: number;
  /**
   * 按钮在开始位置or在起始位置.
   */
  position?: 'start' | 'end';
};

export type ControllerType = ControllerLayout & BaseGraphicAttributes<Partial<ISymbolGraphicAttribute>>;
