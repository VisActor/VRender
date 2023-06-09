import { isNil, merge } from '@visactor/vutils';
import { TooltipRowAttrs, TooltipRowStyleAttrs } from './type';

export const mergeRowAttrs = (
  target: TooltipRowAttrs | TooltipRowStyleAttrs,
  ...sources: (TooltipRowAttrs | TooltipRowStyleAttrs)[]
): TooltipRowAttrs | TooltipRowStyleAttrs => {
  const shapeList = [target.shape, ...sources.map(s => s?.shape)];
  const keyList = [target.key, ...sources.map(s => s?.key)];
  const valueList = [target.value, ...sources.map(s => s?.value)];

  return merge(target, ...sources, {
    shape: shapeList.every(isNil) ? undefined : merge({}, ...shapeList),
    key: keyList.every(isNil) ? undefined : merge({}, ...keyList),
    value: valueList.every(isNil) ? undefined : merge({}, ...valueList)
  }) as TooltipRowAttrs | TooltipRowStyleAttrs;
};
