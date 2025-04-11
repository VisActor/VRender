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
import { InputText } from './input-text';
import { LabelItemAppear, LabelItemDisappear } from './label-item-animate';
import { IncreaseCount } from './number';
import { PoptipAppear, PoptipDisappear } from './poptip-animate';
import { InputRichText } from './richtext/input-richtext';
import { OutputRichText } from './richtext/output-richtext';
import { SlideRichText } from './richtext/slide-richtext';
import { SlideOutRichText } from './richtext/slide-out-richtext';
import { ScaleIn, ScaleOut } from './scale';
import { State } from './state';
import {
  GrowIn,
  GrowOut,
  MoveRotateIn,
  MoveRotateOut,
  MoveScaleIn,
  MoveScaleOut,
  SlideIn,
  SlideOut,
  SpinIn,
  SpinOut
} from './story';
import { Update } from './update';
import { MoveIn, MoveOut } from './move';
import { RotateIn, RotateOut } from './rotate';
import { MotionPath } from './motionPath';
import { FromTo } from './fromTo';
import { GroupFadeIn, GroupFadeOut } from './groupFade';
import { StreamLight } from './streamLight';

export const registerCustomAnimate = () => {
  // 基础动画
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
  // state和update共用一个自定义动画类
  AnimateExecutor.registerBuiltInAnimate('update', Update);
  AnimateExecutor.registerBuiltInAnimate('state', State);
  // Label item animations
  AnimateExecutor.registerBuiltInAnimate('labelItemAppear', LabelItemAppear);
  AnimateExecutor.registerBuiltInAnimate('labelItemDisappear', LabelItemDisappear);
  // Poptip animations
  AnimateExecutor.registerBuiltInAnimate('poptipAppear', PoptipAppear);
  AnimateExecutor.registerBuiltInAnimate('poptipDisappear', PoptipDisappear);

  // Text input animations
  AnimateExecutor.registerBuiltInAnimate('inputText', InputText);
  AnimateExecutor.registerBuiltInAnimate('inputRichText', InputRichText);
  AnimateExecutor.registerBuiltInAnimate('outputRichText', OutputRichText);
  AnimateExecutor.registerBuiltInAnimate('slideRichText', SlideRichText);
  AnimateExecutor.registerBuiltInAnimate('slideOutRichText', SlideOutRichText);

  // 故事化动画 - 入场
  AnimateExecutor.registerBuiltInAnimate('slideIn', SlideIn);
  AnimateExecutor.registerBuiltInAnimate('growIn', GrowIn);
  AnimateExecutor.registerBuiltInAnimate('spinIn', SpinIn);
  AnimateExecutor.registerBuiltInAnimate('moveScaleIn', MoveScaleIn);
  AnimateExecutor.registerBuiltInAnimate('moveRotateIn', MoveRotateIn);

  // 故事化动画 - 出场
  AnimateExecutor.registerBuiltInAnimate('slideOut', SlideOut);
  AnimateExecutor.registerBuiltInAnimate('growOut', GrowOut);
  AnimateExecutor.registerBuiltInAnimate('spinOut', SpinOut);
  AnimateExecutor.registerBuiltInAnimate('moveScaleOut', MoveScaleOut);
  AnimateExecutor.registerBuiltInAnimate('moveRotateOut', MoveRotateOut);

  // 路径动画
  AnimateExecutor.registerBuiltInAnimate('MotionPath', MotionPath);
  // 流光动画
  AnimateExecutor.registerBuiltInAnimate('streamLight', StreamLight);
};

export {
  ClipIn,
  ClipOut,
  FadeIn,
  FadeOut,
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
  IncreaseCount,
  PoptipAppear,
  PoptipDisappear,
  ScaleIn,
  ScaleOut,
  MoveIn,
  MoveOut,
  RotateIn,
  RotateOut,
  State,
  Update,
  MotionPath,
  LabelItemAppear,
  LabelItemDisappear,
  InputText,
  InputRichText,
  OutputRichText,
  SlideRichText,
  SlideOutRichText,
  SlideIn,
  GrowIn,
  SpinIn,
  MoveScaleIn,
  MoveRotateIn,
  SlideOut,
  GrowOut,
  SpinOut,
  MoveScaleOut,
  MoveRotateOut,
  GroupFadeIn,
  GroupFadeOut,
  FromTo,
  StreamLight
};
