import { AnimateExecutor } from '../executor/animate-executor';
import { ClipIn, ClipOut } from './clip';
import { FadeIn, FadeOut } from './fade';
import { FromTo } from './fromTo';
import { GrowAngleIn, GrowAngleOut } from './growAngle';
import { GrowCenterIn, GrowCenterOut } from './growCenter';
import { GrowHeightIn, GrowHeightOut } from './growHeight';
import {
  GrowPointsIn,
  GrowPointsOut,
  GrowPointsXIn,
  GrowPointsXOut,
  GrowPointsYIn,
  GrowPointsYOut
} from './growPoints';
import { GrowRadiusIn, GrowRadiusOut } from './growRadius';
import { GrowWidthIn, GrowWidthOut } from './growWidth';
import { MoveIn, MoveOut } from './move';
import { IncreaseCount } from './number';
import { RotateIn, RotateOut } from './rotate';
import { ScaleIn, ScaleOut } from './scale';
import { State } from './state';
import { Update } from './update';

export const registerBasicCustomAnimate = () => {
  AnimateExecutor.registerBuiltInAnimate('increaseCount', IncreaseCount);

  AnimateExecutor.registerBuiltInAnimate('fromTo', FromTo);
  AnimateExecutor.registerBuiltInAnimate('scaleIn', ScaleIn);
  AnimateExecutor.registerBuiltInAnimate('scaleOut', ScaleOut);
  AnimateExecutor.registerBuiltInAnimate('growHeightIn', GrowHeightIn);
  AnimateExecutor.registerBuiltInAnimate('growHeightOut', GrowHeightOut);
  AnimateExecutor.registerBuiltInAnimate('growWidthIn', GrowWidthIn);
  AnimateExecutor.registerBuiltInAnimate('growWidthOut', GrowWidthOut);
  AnimateExecutor.registerBuiltInAnimate('growCenterIn', GrowCenterIn);
  AnimateExecutor.registerBuiltInAnimate('growCenterOut', GrowCenterOut);
  AnimateExecutor.registerBuiltInAnimate('clipIn', ClipIn);
  AnimateExecutor.registerBuiltInAnimate('clipOut', ClipOut);
  AnimateExecutor.registerBuiltInAnimate('fadeIn', FadeIn);
  AnimateExecutor.registerBuiltInAnimate('fadeOut', FadeOut);
  AnimateExecutor.registerBuiltInAnimate('growPointsIn', GrowPointsIn);
  AnimateExecutor.registerBuiltInAnimate('growPointsOut', GrowPointsOut);
  AnimateExecutor.registerBuiltInAnimate('growPointsXIn', GrowPointsXIn);
  AnimateExecutor.registerBuiltInAnimate('growPointsXOut', GrowPointsXOut);
  AnimateExecutor.registerBuiltInAnimate('growPointsYIn', GrowPointsYIn);
  AnimateExecutor.registerBuiltInAnimate('growPointsYOut', GrowPointsYOut);
  AnimateExecutor.registerBuiltInAnimate('growAngleIn', GrowAngleIn);
  AnimateExecutor.registerBuiltInAnimate('growAngleOut', GrowAngleOut);
  AnimateExecutor.registerBuiltInAnimate('growRadiusIn', GrowRadiusIn);
  AnimateExecutor.registerBuiltInAnimate('growRadiusOut', GrowRadiusOut);
  AnimateExecutor.registerBuiltInAnimate('moveIn', MoveIn);
  AnimateExecutor.registerBuiltInAnimate('moveOut', MoveOut);
  AnimateExecutor.registerBuiltInAnimate('rotateIn', RotateIn);
  AnimateExecutor.registerBuiltInAnimate('rotateOut', RotateOut);
  AnimateExecutor.registerBuiltInAnimate('update', Update);
  AnimateExecutor.registerBuiltInAnimate('state', State);
};

export {
  ClipIn,
  ClipOut,
  FadeIn,
  FadeOut,
  FromTo,
  GrowAngleIn,
  GrowAngleOut,
  GrowCenterIn,
  GrowCenterOut,
  GrowHeightIn,
  GrowHeightOut,
  GrowPointsIn,
  GrowPointsOut,
  GrowPointsXIn,
  GrowPointsXOut,
  GrowPointsYIn,
  GrowPointsYOut,
  GrowRadiusIn,
  GrowRadiusOut,
  GrowWidthIn,
  GrowWidthOut,
  MoveIn,
  MoveOut,
  IncreaseCount,
  RotateIn,
  RotateOut,
  ScaleIn,
  ScaleOut,
  State,
  Update
};
