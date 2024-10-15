import type { IText, ITextGraphicAttribute, EasingType } from '@visactor/vrender-core';
import { IncreaseCount } from '@visactor/vrender-core';
import type { ILabelAnimation, ILabelUpdateAnimation, ILabelUpdateChannelAnimation, LabelContent } from '../type';
import { array, isArray, isEmpty, isValidNumber } from '@visactor/vutils';

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

export function updateAnimation(
  prev: LabelContent['text'],
  next: LabelContent['text'],
  animationConfig: ILabelUpdateAnimation | ILabelUpdateChannelAnimation[]
) {
  if (!isArray(animationConfig)) {
    const { duration, easing, increaseEffect = true } = animationConfig;
    prev.animate().to(next.attribute, duration, easing);
    if (increaseEffect && prev.type === 'text' && next.type === 'text') {
      playIncreaseCount(prev as IText, next as IText, duration, easing);
    }
    return;
  }

  animationConfig.forEach(cfg => {
    const { duration, easing, increaseEffect = true, channel } = cfg;
    const { to } = update(prev, next, channel, cfg.options);
    if (!isEmpty(to)) {
      prev.animate().to(to, duration, easing);
    }

    if (increaseEffect && prev.type === 'text' && next.type === 'text') {
      playIncreaseCount(prev as IText, next as IText, duration, easing);
    }
  });
}

export const update = (
  prev: LabelContent['text'],
  next: LabelContent['text'],
  channel?: string[],
  options?: ILabelUpdateChannelAnimation['options']
) => {
  const from = Object.assign({}, prev.attribute);
  const to = Object.assign({}, next.attribute);
  array(options?.excludeChannels).forEach(key => {
    delete to[key];
  });
  Object.keys(to).forEach(key => {
    if (channel && !channel.includes(key)) {
      delete to[key];
    }
  });
  return { from, to };
};

export function playIncreaseCount(prev: IText, next: IText, duration: number, easing: EasingType) {
  if (
    prev.attribute.text !== next.attribute.text &&
    isValidNumber(Number(prev.attribute.text) * Number(next.attribute.text))
  ) {
    prev
      .animate()
      .play(
        new IncreaseCount(
          { text: prev.attribute.text as string },
          { text: next.attribute.text as string },
          duration,
          easing
        )
      );
  }
}

export const DefaultLabelAnimation: ILabelAnimation = {
  mode: 'same-time',
  duration: 300,
  easing: 'linear' as EasingType
};
