import { AnimateExecutor } from '../executor/animate-executor';
import { ClipIn, ClipOut } from './clip';
import { FadeIn, FadeOut } from './fade';
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
import { LabelItemAppear, LabelItemDisappear } from './label-item-animate';
import { IncreaseCount } from './number';
import { PoptipAppear, PoptipDisappear } from './poptip-animate';
import { ScaleIn, ScaleOut } from './scale';
import { State } from './state';
import { Update } from './update';

export const registerCustomAnimate = () => {
  // 基础动画
  AnimateExecutor.registerBuiltInAnimate('increaseCount', IncreaseCount);

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
  // state和update共用一个自定义动画类
  AnimateExecutor.registerBuiltInAnimate('update', Update);
  AnimateExecutor.registerBuiltInAnimate('state', State);
  // Label item animations
  AnimateExecutor.registerBuiltInAnimate('labelItemAppear', LabelItemAppear);
  AnimateExecutor.registerBuiltInAnimate('labelItemDisappear', LabelItemDisappear);
  // Poptip animations
  AnimateExecutor.registerBuiltInAnimate('poptipAppear', PoptipAppear);
  AnimateExecutor.registerBuiltInAnimate('poptipDisappear', PoptipDisappear);
};
