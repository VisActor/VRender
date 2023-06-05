import { OrientType } from '../interface';
import { DirectionEnum, DirectionType } from './type';

/**
 * 检测下标是否正确
 */
interface ICheckIndex {
  direction: DirectionType;
  maxIndex: number;
  minIndex: number;
  dataIndex: number;
}
export const checkIndex = ({ direction, maxIndex, minIndex, dataIndex }: ICheckIndex): boolean => {
  // 若默认方向, 检测下标是否合法
  if (direction === DirectionEnum.Default) {
    return dataIndex < maxIndex;
  }
  // 若逆向, 检测下标是否合法
  else if (direction === DirectionEnum.Reverse) {
    return dataIndex > minIndex;
  }
};

/**
 * 判断能否进入循环
 */

export const canPlay = ({ direction, maxIndex, minIndex, dataIndex }: ICheckIndex): boolean => {
  return checkIndex({ direction, maxIndex, minIndex, dataIndex });
};

/**
 * 判断是否到达了末尾
 */
export const isReachEndByDefault = ({ direction, maxIndex, dataIndex }: Omit<ICheckIndex, 'minIndex'>) => {
  if (direction === DirectionEnum.Default) {
    return dataIndex === maxIndex;
  }
  return false;
};

export const isReachEndByReverse = ({ direction, minIndex, dataIndex }: Omit<ICheckIndex, 'maxIndex'>) => {
  if (direction === DirectionEnum.Reverse) {
    return dataIndex === minIndex;
  }
  return false;
};

export const isReachEnd = ({ direction, maxIndex, minIndex, dataIndex }: ICheckIndex) => {
  return (
    isReachEndByDefault({ direction, maxIndex, dataIndex }) || isReachEndByReverse({ direction, minIndex, dataIndex })
  );
};

/**
 * 判断是否处于起点
 */
export const isReachStartByDefault = ({ direction, minIndex, dataIndex }: Omit<ICheckIndex, 'maxIndex'>) => {
  if (direction === DirectionEnum.Default) {
    return dataIndex === minIndex;
  }
  return false;
};

export const isReachStartByReverse = ({ direction, maxIndex, dataIndex }: Omit<ICheckIndex, 'minIndex'>) => {
  if (direction === DirectionEnum.Reverse) {
    return dataIndex === maxIndex;
  }
  return false;
};

export const isReachStart = ({ direction, maxIndex, minIndex, dataIndex }: ICheckIndex) => {
  return (
    isReachStartByDefault({ direction, minIndex, dataIndex }) ||
    isReachStartByReverse({ direction, maxIndex, dataIndex })
  );
};

/**
 * 得到初始化下标
 */

export const isVertical = (orient: OrientType) => orient === 'left' || orient === 'right';

export const isHorizontal = (orient: OrientType) => orient === 'top' || orient === 'bottom';

export const forwardStep = (direction: DirectionType, currentIndex: number, min: number, max: number) => {
  if (direction === 'default') {
    return Math.min(currentIndex + 1, max);
  }
  return Math.max(currentIndex - 1, min);
};
