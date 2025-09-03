import type { IBoundsLike } from '@visactor/vutils';

/**
 * 判断文字是否超出datazoom范围
 */
export const isTextOverflow = (
  componentBoundsLike: IBoundsLike,
  textBounds: IBoundsLike | null,
  layout: 'start' | 'end',
  isHorizontal: boolean
) => {
  if (!textBounds) {
    return false;
  }
  if (isHorizontal) {
    if (layout === 'start') {
      if (textBounds.x1 < componentBoundsLike.x1) {
        return true;
      }
    } else {
      if (textBounds.x2 > componentBoundsLike.x2) {
        return true;
      }
    }
  } else {
    if (layout === 'start') {
      if (textBounds.y1 < componentBoundsLike.y1) {
        return true;
      }
    } else {
      if (textBounds.y2 > componentBoundsLike.y2) {
        return true;
      }
    }
  }
  return false;
};
