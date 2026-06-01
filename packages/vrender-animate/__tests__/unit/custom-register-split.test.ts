import { registerBasicCustomAnimate } from '../../src/custom/register-basic';
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

const optionalKeys = [
  'MotionPath',
  'dissolve',
  'distortion',
  'gaussianBlur',
  'glitch',
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
  'particle',
  'pixelation',
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
  'grayscale'
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

  test('registerCustomAnimate keeps the full custom animation surface', () => {
    registerCustomAnimate();

    expect(registeredKeys()).toEqual([...basicKeys, ...optionalKeys].sort());
  });
});
