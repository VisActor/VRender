import { AnimateExecutor } from '../executor/animate-executor';
import { registerBasicCustomAnimate } from './register-basic';
import { LabelItemAppear, LabelItemDisappear } from './label-item-animate';
import { PoptipAppear, PoptipDisappear } from './poptip-animate';
import {
  GrowIn,
  GrowOut,
  MoveRotateIn,
  MoveRotateOut,
  MoveScaleIn,
  MoveScaleOut,
  PulseAnimate,
  SlideIn,
  SlideOut,
  SpinIn,
  SpinOut,
  StrokeIn,
  StrokeOut
} from './story';
import { MotionPath } from './motionPath';
import { GroupFadeIn, GroupFadeOut } from './groupFade';
import { StreamLight } from './streamLight';
import { registerDisappearCustomAnimate } from './register-disappear';
import { registerRichTextCustomAnimate } from './register-richtext';

export const registerCustomAnimate = () => {
  registerBasicCustomAnimate();
  // Label item animations
  AnimateExecutor.registerBuiltInAnimate('labelItemAppear', LabelItemAppear);
  AnimateExecutor.registerBuiltInAnimate('labelItemDisappear', LabelItemDisappear);
  // Poptip animations
  AnimateExecutor.registerBuiltInAnimate('poptipAppear', PoptipAppear);
  AnimateExecutor.registerBuiltInAnimate('poptipDisappear', PoptipDisappear);

  registerRichTextCustomAnimate();

  // 故事化动画 - 入场
  AnimateExecutor.registerBuiltInAnimate('slideIn', SlideIn);
  AnimateExecutor.registerBuiltInAnimate('growIn', GrowIn);
  AnimateExecutor.registerBuiltInAnimate('spinIn', SpinIn);
  AnimateExecutor.registerBuiltInAnimate('moveScaleIn', MoveScaleIn);
  AnimateExecutor.registerBuiltInAnimate('moveRotateIn', MoveRotateIn);
  AnimateExecutor.registerBuiltInAnimate('strokeIn', StrokeIn);

  // 故事化动画 - 出场
  AnimateExecutor.registerBuiltInAnimate('slideOut', SlideOut);
  AnimateExecutor.registerBuiltInAnimate('growOut', GrowOut);
  AnimateExecutor.registerBuiltInAnimate('spinOut', SpinOut);
  AnimateExecutor.registerBuiltInAnimate('moveScaleOut', MoveScaleOut);
  AnimateExecutor.registerBuiltInAnimate('moveRotateOut', MoveRotateOut);
  AnimateExecutor.registerBuiltInAnimate('strokeOut', StrokeOut);

  // 特效动画
  AnimateExecutor.registerBuiltInAnimate('pulse', PulseAnimate);

  // 路径动画
  AnimateExecutor.registerBuiltInAnimate('MotionPath', MotionPath);
  // 流光动画
  AnimateExecutor.registerBuiltInAnimate('streamLight', StreamLight);

  registerDisappearCustomAnimate();
};

export {
  PoptipAppear,
  PoptipDisappear,
  MotionPath,
  LabelItemAppear,
  LabelItemDisappear,
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
  StrokeIn,
  StrokeOut,
  PulseAnimate,
  GroupFadeIn,
  GroupFadeOut,
  StreamLight
};

export { Dissolve, Grayscale, Distortion, Particle, Glitch, GaussianBlur, Pixelation } from './register-disappear';

export { InputText, InputRichText, OutputRichText, SlideRichText, SlideOutRichText } from './register-richtext';

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
  IncreaseCount,
  MoveIn,
  MoveOut,
  RotateIn,
  RotateOut,
  ScaleIn,
  ScaleOut,
  State,
  Update
} from './register-basic';
