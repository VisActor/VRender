import { type IPointLike, calculateAnchorOfArc } from '@visactor/vutils';
import { IMarkCommonArcLabelPosition } from './type';

export const transformArcPosToAnchorType = (position: IMarkCommonArcLabelPosition) => {
  switch (position) {
    case IMarkCommonArcLabelPosition.arcInnerStart:
      return 'inner-start';
    case IMarkCommonArcLabelPosition.arcInnerEnd:
      return 'inner-end';
    case IMarkCommonArcLabelPosition.arcInnerMiddle:
      return 'inner-middle';
    case IMarkCommonArcLabelPosition.arcOuterStart:
      return 'outer-start';
    case IMarkCommonArcLabelPosition.arcOuterEnd:
      return 'outer-end';
    case IMarkCommonArcLabelPosition.arcOuterMiddle:
      return 'outer-middle';
  }
  return position;
};

export const getPointAttrByArcPosition = (
  position: IMarkCommonArcLabelPosition,
  labelHeight: number,
  arcAttr: {
    center: IPointLike;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    refX: number;
    refY: number;
  }
) => {
  const { center, innerRadius, outerRadius, startAngle, endAngle, refX, refY } = arcAttr;

  const { radius, angle } = calculateAnchorOfArc(
    { innerRadius, outerRadius, startAngle, endAngle },
    transformArcPosToAnchorType(position)
  );
  // tag在正交方向是向内偏移，还是向外偏移
  // 不偏移: 0, 内: -1, 外: 1
  const orthogonalOffsetDirection = position.includes('Inner') ? -1 : position.includes('Outer') ? 1 : 0;

  return {
    position: {
      x:
        center.x +
        (radius + (orthogonalOffsetDirection * labelHeight) / 2 + refY) * Math.cos(angle) +
        refX * Math.cos(angle - Math.PI / 2),
      y:
        center.y +
        (radius + (orthogonalOffsetDirection * labelHeight) / 2 + refY) * Math.sin(angle) +
        refX * Math.sin(angle - Math.PI / 2)
    },
    angle
  };
};
