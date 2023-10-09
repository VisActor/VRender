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
} & IGroupGraphicAttribute;
