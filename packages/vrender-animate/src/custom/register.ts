import { AnimateExecutor } from '../executor/animate-executor';
import { registerBasicCustomAnimate } from './register-basic';
import { InputText } from './input-text';
import { LabelItemAppear, LabelItemDisappear } from './label-item-animate';
import { PoptipAppear, PoptipDisappear } from './poptip-animate';
import { InputRichText } from './richtext/input-richtext';
import { OutputRichText } from './richtext/output-richtext';
import { SlideRichText } from './richtext/slide-richtext';
import { SlideOutRichText } from './richtext/slide-out-richtext';
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

export const registerCustomAnimate = () => {
  registerBasicCustomAnimate();
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
  StrokeIn,
  StrokeOut,
  PulseAnimate,
  GroupFadeIn,
  GroupFadeOut,
  StreamLight
};

export { Dissolve, Grayscale, Distortion, Particle, Glitch, GaussianBlur, Pixelation } from './register-disappear';

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
