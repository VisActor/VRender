import type { IGroupGraphicAttribute } from '@visactor/vrender-core';

export type Datum = any;

export type BasePlayerAttributes = {
  /**
   * 组件显隐配置
   * @default true
   */
  visible?: boolean;

  /**
   * 数据项
   */
  data: Datum[];

  /**
   * 数据下标
   */
  dataIndex?: number;
  /**
   * 关闭交互效果
   * @default false
   */
  disableTriggerEvent?: boolean;

  /**
   * 是否循环播放
   * @default false
   * @description 在绘制时没有实际意义，但会用于判断前进后退时，index是否循环递进
   */
  loop?: boolean;
} & IGroupGraphicAttribute;
