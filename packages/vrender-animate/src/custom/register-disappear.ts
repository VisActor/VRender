import { AnimateExecutor } from '../executor/animate-executor';
import { Dissolve } from './disappear/dissolve';
import { Distortion } from './disappear/distortion';
import { GaussianBlur } from './disappear/gaussian-blur';
import { Glitch } from './disappear/glitch';
import { Grayscale } from './disappear/grayscale';
import { Particle } from './disappear/particle';
import { Pixelation } from './disappear/pixelation';

export const registerDisappearCustomAnimate = () => {
  AnimateExecutor.registerBuiltInAnimate('dissolve', Dissolve);
  AnimateExecutor.registerBuiltInAnimate('grayscale', Grayscale);
  AnimateExecutor.registerBuiltInAnimate('distortion', Distortion);
  AnimateExecutor.registerBuiltInAnimate('particle', Particle);
  AnimateExecutor.registerBuiltInAnimate('glitch', Glitch);
  AnimateExecutor.registerBuiltInAnimate('gaussianBlur', GaussianBlur);
  AnimateExecutor.registerBuiltInAnimate('pixelation', Pixelation);
};

export { Dissolve, Grayscale, Distortion, Particle, Glitch, GaussianBlur, Pixelation };
