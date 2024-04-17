import type { IRichText, ISymbol, IImage, IArc } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import type { ILine, IPolygon } from '@visactor/vrender-core';
import type { ArcSegment, Segment } from '../../segment';
import type { Tag } from '../../tag';
import type {
  CommonMarkAreaAnimationType,
  CommonMarkLineAnimationType,
  MarkPointAnimationType,
  MarkerAnimationState,
  MarkerExitAnimation,
  MarkerUpdateAnimation
} from '../type';
import { commonLineClipIn } from './clip-in';
import { areaFadeIn, commonLineFadeIn, arcAreaFadeIn, pointFadeIn } from './fade-in';
import { areaFadeOut, commonLineFadeOut, arcAreaFadeOut, pointFadeOut } from './fade-out';
import { pointCallIn } from './call-in';

export function commonMarkLineAnimate(
  line: Segment | ArcSegment,
  label: Tag,
  animationconfig: any,
  state: MarkerAnimationState
) {
  const { enter, update, exit } = animationconfig;
  if (state === 'enter') {
    const { type, duration, delay, easing } = enter;
    if (type === 'clipIn') {
      commonLineClipIn(line, label, duration, delay, easing);
    } else if (type === 'fadeIn') {
      commonLineFadeIn(line, label, duration, delay, easing);
    }
  } else if (state === 'update') {
    const { type, duration, delay, easing } = update;
    if (type === 'clipIn') {
      commonLineClipIn(line, label, duration, delay, easing);
    } else if (type === 'fadeIn') {
      commonLineFadeIn(line, label, duration, delay, easing);
    }
  } else if (state === 'exit') {
    const { duration, delay, easing } = exit;
    commonLineFadeOut(line, label, duration, delay, easing);
  }
}

export function markAreaAnimate(area: IPolygon, label: Tag, animationconfig: any, state: MarkerAnimationState) {
  const { enter, update, exit } = animationconfig;
  if (state === 'enter') {
    const { type, duration, delay, easing } = enter;
    if (type === 'fadeIn') {
      areaFadeIn(area, label, duration, delay, easing);
    }
  } else if (state === 'update') {
    const { type, duration, delay, easing } = update;
    if (type === 'fadeIn') {
      areaFadeIn(area, label, duration, delay, easing);
    }
  } else if (state === 'exit') {
    const { duration, delay, easing } = exit;
    areaFadeOut(area, label, duration, delay, easing);
  }
}

export function markArcAreaAnimate(area: IArc, label: Tag, animationconfig: any, state: MarkerAnimationState) {
  const { enter, update, exit } = animationconfig;
  if (state === 'enter') {
    const { type, duration, delay, easing } = enter;
    if (type === 'fadeIn') {
      arcAreaFadeIn(area, label, duration, delay, easing);
    }
  } else if (state === 'update') {
    const { type, duration, delay, easing } = update;
    if (type === 'fadeIn') {
      arcAreaFadeIn(area, label, duration, delay, easing);
    }
  } else if (state === 'exit') {
    const { duration, delay, easing } = exit;
    arcAreaFadeOut(area, label, duration, delay, easing);
  }
}

export function markPointAnimate(
  lines: [Segment, ILine],
  item: Tag | IRichText | ISymbol | IImage,
  animationconfig: any,
  state: MarkerAnimationState
) {
  const [itemLine, decorativeLine] = lines;
  const { enter, update, exit } = animationconfig;
  if (state === 'enter') {
    const { type, duration, delay, easing } = enter;
    if (type === 'fadeIn') {
      pointFadeIn(itemLine, decorativeLine, item, duration, delay, easing);
    } else if (type === 'callIn') {
      pointCallIn(itemLine, decorativeLine, item, duration, delay, easing);
    }
  } else if (state === 'update') {
    const { type, duration, delay, easing } = update;
    if (type === 'fadeIn') {
      pointFadeIn(itemLine, decorativeLine, item, duration, delay, easing);
    } else if (type === 'callIn') {
      pointCallIn(itemLine, decorativeLine, item, duration, delay, easing);
    }
  } else if (state === 'exit') {
    const { duration, delay, easing } = exit;
    pointFadeOut(itemLine, decorativeLine, item, duration, delay, easing);
  }
}

export const DefaultUpdateMarkLineAnimation: MarkerUpdateAnimation<CommonMarkLineAnimationType> = {
  type: 'clipIn',
  duration: 500,
  easing: 'linear',
  delay: 0
} as any;

export const DefaultUpdateMarkAreaAnimation: MarkerUpdateAnimation<CommonMarkAreaAnimationType> = {
  type: 'fadeIn',
  duration: 500,
  easing: 'linear',
  delay: 0
} as any;

export const DefaultUpdateMarkPointAnimation: MarkerUpdateAnimation<MarkPointAnimationType> = {
  type: 'callIn',
  duration: 500,
  easing: 'linear',
  delay: 0
} as any;

export const DefaultExitMarkerAnimation: MarkerExitAnimation = {
  type: 'fadeOut',
  duration: 500,
  easing: 'linear',
  delay: 0
};
