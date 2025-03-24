import { AnimateExecutor } from '../executor/animate-executor';
import { ClipIn, ClipOut } from './clip';
import { FadeIn, FadeOut } from './fade';
import { GrowCenterIn, GrowCenterOut } from './growCenter';
import { GrowHeightIn, GrowHeightOut } from './growHeight';
import { GrowWidthIn, GrowWidthOut } from './growWidth';
import { ScaleIn, ScaleOut } from './scale';
import { State } from './state';
import { Update } from './update';

export const registerCustomAnimate = () => {
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
  // state和update共用一个自定义动画类
  AnimateExecutor.registerBuiltInAnimate('update', Update);
  AnimateExecutor.registerBuiltInAnimate('state', State);
};
