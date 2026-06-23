import { registerBasicCustomAnimate } from '../../src/custom/register-basic';
import { registerDisappearCustomAnimate } from '../../src/custom/register-disappear';
import { registerRichTextCustomAnimate } from '../../src/custom/register-richtext';
import { registerStoryCustomAnimate } from '../../src/custom/register-story';
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

const richTextKeys = ['inputRichText', 'inputText', 'outputRichText', 'slideOutRichText', 'slideRichText'].sort();

const storyKeys = [
  'MotionPath',
  'growIn',
  'growOut',
  'moveRotateIn',
  'moveRotateOut',
  'moveScaleIn',
  'moveScaleOut',
  'pulse',
  'slideIn',
  'slideOut',
  'spinIn',
  'spinOut',
  'streamLight',
  'strokeIn',
  'strokeOut'
].sort();

const optionalKeys = [
  ...storyKeys,
  'labelItemAppear',
  'labelItemDisappear',
  'poptipAppear',
  'poptipDisappear',
  ...disappearKeys,
  ...richTextKeys
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

  test('registerRichTextCustomAnimate only installs text and richtext animations', () => {
    registerRichTextCustomAnimate();

    expect(registeredKeys()).toEqual(richTextKeys);
    expect(AnimateExecutor.builtInAnimateMap.inputText).toBeDefined();
    expect(AnimateExecutor.builtInAnimateMap.inputRichText).toBeDefined();
    expect(AnimateExecutor.builtInAnimateMap.scaleIn).toBeUndefined();
    expect(AnimateExecutor.builtInAnimateMap.dissolve).toBeUndefined();
  });

  test('registerStoryCustomAnimate only installs story effect animations', () => {
    registerStoryCustomAnimate();

    expect(registeredKeys()).toEqual(storyKeys);
    expect(AnimateExecutor.builtInAnimateMap.slideIn).toBeDefined();
    expect(AnimateExecutor.builtInAnimateMap.MotionPath).toBeDefined();
    expect(AnimateExecutor.builtInAnimateMap.streamLight).toBeDefined();
    expect(AnimateExecutor.builtInAnimateMap.scaleIn).toBeUndefined();
    expect(AnimateExecutor.builtInAnimateMap.inputRichText).toBeUndefined();
    expect(AnimateExecutor.builtInAnimateMap.dissolve).toBeUndefined();
    expect(AnimateExecutor.builtInAnimateMap.poptipAppear).toBeUndefined();
  });

  test('registerCustomAnimate keeps the full custom animation surface', () => {
    registerCustomAnimate();

    expect(registeredKeys()).toEqual([...basicKeys, ...optionalKeys].sort());
  });
});
