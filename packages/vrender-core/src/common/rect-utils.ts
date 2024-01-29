import { isNil } from '@visactor/vutils';
import type { IRectGraphicAttribute } from '../interface/graphic/rect';

export const normalizeRectAttributes = (attribute: IRectGraphicAttribute) => {
  if (!attribute) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let width = isNil(attribute.width) ? attribute.x1 - attribute.x : attribute.width;
  let height = isNil(attribute.height) ? attribute.y1 - attribute.y : attribute.height;
  let x = 0;
  let y = 0;

  if (width < 0) {
    x = width;
    width = -width;
  } else if (Number.isNaN(width)) {
    width = 0;
  }

  if (height < 0) {
    y = height;
    height = -height;
  } else if (Number.isNaN(height)) {
    height = 0;
  }

  return { x, y, width, height };
};
