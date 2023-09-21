import type { EasingType, ITextGraphicAttribute } from '@visactor/vrender-core';
import type { ILabelAnimation } from '../type';

const fadeIn = (textAttribute: ITextGraphicAttribute = {}) => {
  return {
    from: {
      opacity: 0,
      fillOpacity: 0,
      strokeOpacity: 0
    },
    to: {
      opacity: textAttribute.opacity ?? 1,
      fillOpacity: textAttribute.fillOpacity ?? 1,
      strokeOpacity: textAttribute.strokeOpacity ?? 1
    }
  };
};

const fadeOut = (textAttribute: ITextGraphicAttribute = {}) => {
  return {
    from: {
      opacity: textAttribute.opacity ?? 1,
      fillOpacity: textAttribute.fillOpacity ?? 1,
      strokeOpacity: textAttribute.strokeOpacity ?? 1
    },
    to: {
      opacity: 0,
      fillOpacity: 0,
      strokeOpacity: 0
    }
  };
};

const animationEffects = { fadeIn, fadeOut };

export function getAnimationAttributes(
  textAttribute: ITextGraphicAttribute,
  type: 'fadeIn' | 'fadeOut'
): {
  from: any;
  to: any;
} {
  return animationEffects[type]?.(textAttribute) ?? { from: {}, to: {} };
}

export const DefaultLabelAnimation: ILabelAnimation = {
  mode: 'same-time',
  duration: 300,
  easing: 'linear' as EasingType
};
