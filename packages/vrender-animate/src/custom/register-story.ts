import { AnimateExecutor } from '../executor/animate-executor';
import { MotionPath } from './motionPath';
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
import { StreamLight } from './streamLight';

export const registerStoryCustomAnimate = () => {
  AnimateExecutor.registerBuiltInAnimate('slideIn', SlideIn);
  AnimateExecutor.registerBuiltInAnimate('growIn', GrowIn);
  AnimateExecutor.registerBuiltInAnimate('spinIn', SpinIn);
  AnimateExecutor.registerBuiltInAnimate('moveScaleIn', MoveScaleIn);
  AnimateExecutor.registerBuiltInAnimate('moveRotateIn', MoveRotateIn);
  AnimateExecutor.registerBuiltInAnimate('strokeIn', StrokeIn);

  AnimateExecutor.registerBuiltInAnimate('slideOut', SlideOut);
  AnimateExecutor.registerBuiltInAnimate('growOut', GrowOut);
  AnimateExecutor.registerBuiltInAnimate('spinOut', SpinOut);
  AnimateExecutor.registerBuiltInAnimate('moveScaleOut', MoveScaleOut);
  AnimateExecutor.registerBuiltInAnimate('moveRotateOut', MoveRotateOut);
  AnimateExecutor.registerBuiltInAnimate('strokeOut', StrokeOut);

  AnimateExecutor.registerBuiltInAnimate('pulse', PulseAnimate);
  AnimateExecutor.registerBuiltInAnimate('MotionPath', MotionPath);
  AnimateExecutor.registerBuiltInAnimate('streamLight', StreamLight);
};

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
};
