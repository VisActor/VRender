import { registerBasicCustomAnimate } from '../../src/custom/register-basic';
import { registerDisappearCustomAnimate } from '../../src/custom/register-disappear';
import { registerCustomAnimate } from '../../src/custom/register';
import { AnimateExecutor } from '../../src/executor/animate-executor';

const basicKeys = [
  'clipIn',
  'clipOut',
  'fadeIn',
  'fadeOut',
  'fromTo',
  'growAngleIn',
  'growAngleOut',
  'growCenterIn',
  'growCenterOut',
  'growHeightIn',
  'growHeightOut',
  'growPointsIn',
  'growPointsOut',
  'growPointsXIn',
  'growPointsXOut',
  'growPointsYIn',
  'growPointsYOut',
  'growRadiusIn',
  'growRadiusOut',
  'growWidthIn',
  'growWidthOut',
  'increaseCount',
  'moveIn',
  'moveOut',
  'rotateIn',
  'rotateOut',
  'scaleIn',
  'scaleOut',
  'state',
  'update'
].sort();

const disappearKeys = [
  'dissolve',
  'distortion',
  'gaussianBlur',
  'glitch',
  'grayscale',
  'particle',
  'pixelation'
].sort();

const optionalKeys = [
  'MotionPath',
  'growIn',
  'growOut',
  'inputRichText',
  'inputText',
  'labelItemAppear',
  'labelItemDisappear',
  'moveRotateIn',
  'moveRotateOut',
  'moveScaleIn',
  'moveScaleOut',
  'outputRichText',
  'poptipAppear',
  'poptipDisappear',
  'pulse',
  'slideIn',
  'slideOut',
  'slideOutRichText',
  'slideRichText',
  'spinIn',
  'spinOut',
  'streamLight',
  'strokeIn',
  'strokeOut',
  ...disappearKeys
].sort();

function registeredKeys() {
  return Object.keys(AnimateExecutor.builtInAnimateMap).sort();
}

describe('custom animate register split', () => {
  const originalBuiltInAnimateMap = AnimateExecutor.builtInAnimateMap;

  beforeEach(() => {
    AnimateExecutor.builtInAnimateMap = {};
  });

  afterAll(() => {
    AnimateExecutor.builtInAnimateMap = originalBuiltInAnimateMap;
  });

  test('registerBasicCustomAnimate only installs basic built-in animations', () => {
    registerBasicCustomAnimate();

    expect(registeredKeys()).toEqual(basicKeys);
    expect(AnimateExecutor.builtInAnimateMap.scaleIn).toBeDefined();
    expect(AnimateExecutor.builtInAnimateMap.MotionPath).toBeUndefined();
    expect(AnimateExecutor.builtInAnimateMap.inputRichText).toBeUndefined();
    expect(AnimateExecutor.builtInAnimateMap.poptipAppear).toBeUndefined();
    expect(AnimateExecutor.builtInAnimateMap.dissolve).toBeUndefined();
  });

  test('registerDisappearCustomAnimate only installs disappear effects', () => {
    registerDisappearCustomAnimate();

    expect(registeredKeys()).toEqual(disappearKeys);
    expect(AnimateExecutor.builtInAnimateMap.dissolve).toBeDefined();
    expect(AnimateExecutor.builtInAnimateMap.gaussianBlur).toBeDefined();
    expect(AnimateExecutor.builtInAnimateMap.scaleIn).toBeUndefined();
    expect(AnimateExecutor.builtInAnimateMap.MotionPath).toBeUndefined();
  });

  test('registerCustomAnimate keeps the full custom animation surface', () => {
    registerCustomAnimate();

    expect(registeredKeys()).toEqual([...basicKeys, ...optionalKeys].sort());
  });
});
