import { BasePlayerAttributes } from './base';
import { DirectionType } from './direction';
import { BasePlayerLayoutAttributes } from './layout';

export type DiscretePlayerAttributes = {
  /**
   * 播放器类型, 离散型
   */
  type: 'discrete';

  /**
   * 播放方向
   * @default 'default'
   */
  direction?: DirectionType;

  /**
   * 交替方向
   * @default false
   */
  alternate?: boolean;

  /**
   * 播放间隔
   * @default 1000
   */
  interval?: number;
} & BasePlayerAttributes &
  BasePlayerLayoutAttributes;
