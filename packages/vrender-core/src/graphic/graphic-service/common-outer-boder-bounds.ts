import type { IAABBBounds } from '@visactor/vutils';
import type { IGraphicAttribute } from '../../interface';

export const updateBoundsOfCommonOuterBorder = (
  attribute: Partial<IGraphicAttribute>,
  theme: Required<IGraphicAttribute>,
  aabbBounds: IAABBBounds
) => {
  const { outerBorder, shadowBlur = theme.shadowBlur } = attribute;
  if (outerBorder) {
    const defaultOuterBorder = theme.outerBorder;
    const { distance = defaultOuterBorder.distance, lineWidth = defaultOuterBorder.lineWidth } = outerBorder;

    // rect的distance一定是number
    aabbBounds.expand((distance as number) + (shadowBlur + lineWidth) / 2);
  }
  return aabbBounds;
};
