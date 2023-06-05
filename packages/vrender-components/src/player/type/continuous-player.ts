import { BasePlayerAttributes } from './base';
import { BasePlayerLayoutAttributes } from './layout';

export type ContinuousPlayerAttributes = {
  /**
   * 播放器类型, 连续型
   */
  type: 'continuous';

  /**
   * 播放器总持续时长
   * Tips: 该配置和interval互斥.
   * @default interval * data.length
   */
  totalDuration?: number;

  /**
   * 播放间隔
   * @default 1000
   */
  interval?: number;
} & BasePlayerAttributes &
  BasePlayerLayoutAttributes;
