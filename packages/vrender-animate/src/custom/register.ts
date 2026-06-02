import { AnimateExecutor } from '../executor/animate-executor';
import { registerBasicCustomAnimate } from './register-basic';
import { LabelItemAppear, LabelItemDisappear } from './label-item-animate';
import { PoptipAppear, PoptipDisappear } from './poptip-animate';
import { registerDisappearCustomAnimate } from './register-disappear';
import { registerRichTextCustomAnimate } from './register-richtext';
import { registerStoryCustomAnimate } from './register-story';

export const registerCustomAnimate = () => {
  registerBasicCustomAnimate();
  // Label item animations
  AnimateExecutor.registerBuiltInAnimate('labelItemAppear', LabelItemAppear);
  AnimateExecutor.registerBuiltInAnimate('labelItemDisappear', LabelItemDisappear);
  // Poptip animations
  AnimateExecutor.registerBuiltInAnimate('poptipAppear', PoptipAppear);
  AnimateExecutor.registerBuiltInAnimate('poptipDisappear', PoptipDisappear);

  registerRichTextCustomAnimate();

  registerStoryCustomAnimate();
  registerDisappearCustomAnimate();
};

export { PoptipAppear, PoptipDisappear, LabelItemAppear, LabelItemDisappear };

export { GroupFadeIn, GroupFadeOut } from './groupFade';

export {
  MotionPath,
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
  StreamLight
} from './register-story';

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
