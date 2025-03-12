import type { IAnimate } from './animate';

export interface ITimeline {
  id: number;
  // 包含的动画数量（animate数组的数量），包含所有动画
  animateCount: number;
  // 添加动画
  addAnimate: (animate: IAnimate) => void;
  // 移除动画
  removeAnimate: (animate: IAnimate, release?: boolean) => void;
  // 更新动画
  tick: (delta: number) => void;
  // 清除动画
  clear: () => void;
  // 暂停动画
  pause: () => void;
  // 恢复动画
  resume: () => void;
  // 设置开始时间
  setStartTime: (time: number) => void;
  // 获取开始时间
  getStartTime: () => number;
  // 获取当前时间
  getCurrentTime: () => number;
  // 设置当前时间
  setCurrentTime: (time: number) => void;
  // 获取动画总时长
  getTotalDuration: () => number;
  // 获取动画的播放状态
  getPlayState: () => 'playing' | 'paused' | 'stopped';
  // 获取动画的播放速度
  getPlaySpeed: () => number;
  // 设置动画的播放速度
  setPlaySpeed: (speed: number) => void;
  // 获取动画的播放方向
  getPlayDirection: () => 'forward' | 'backward';
  // 设置动画的播放方向
  setPlayDirection: (direction: 'forward' | 'backward') => void;
}
