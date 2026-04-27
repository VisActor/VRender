import { createGlyph, createRect, createRichText, createText } from '@visactor/vrender-core';
import { registerAnimate } from '../../src/register';
import { GrowHeightIn } from '../../src/custom/growHeight';
import { GrowWidthIn } from '../../src/custom/growWidth';
import { MotionPath } from '../../src/custom/motionPath';
import { MorphingPath } from '../../src/custom/morphing';
import { InputText } from '../../src/custom/input-text';
import { IncreaseCount } from '../../src/custom/number';
import { InputRichText } from '../../src/custom/richtext/input-richtext';

let animationRuntimeRegistered = false;

function ensureAnimationRuntime() {
  if (animationRuntimeRegistered) {
    return;
  }
  registerAnimate();
  animationRuntimeRegistered = true;
}

describe('custom appear static truth', () => {
  beforeAll(() => {
    ensureAnimationRuntime();
  });

  test('GrowHeightIn applies the appear start frame without polluting static truth', () => {
    const final = {
      x: 78.75,
      y: 31.2,
      y1: 260,
      width: 202.5,
      visible: true
    };
    const rect = createRect(final);
    rect.setFinalAttributes(final);

    const animate = rect.animate({ slience: true });
    animate.play(
      new GrowHeightIn(null, null, 1000, 'linear', {
        options: { overall: 260 },
        controlOptions: {}
      })
    );

    expect((rect as any).baseAttributes.y).toBe(31.2);
    expect((rect as any).baseAttributes.y1).toBe(260);
    expect(rect.attribute.y).toBe(260);
    expect(rect.attribute.y1).toBe(260);
    expect(rect.getFinalAttribute().y).toBe(31.2);
    expect(rect.getFinalAttribute().y1).toBe(260);

    animate.advance(1000);

    expect((rect as any).baseAttributes.y).toBe(31.2);
    expect((rect as any).baseAttributes.y1).toBe(260);
    expect(rect.attribute.y).toBe(31.2);
    expect(rect.attribute.y1).toBe(260);
    expect(rect.getFinalAttribute().y).toBe(31.2);
    expect(rect.getFinalAttribute().y1).toBe(260);
  });

  test('GrowWidthIn applies the appear start frame without polluting static truth', () => {
    const final = {
      x: 40,
      x1: 260,
      y: 10,
      width: 220,
      height: 24,
      visible: true
    };
    const rect = createRect(final);
    rect.setFinalAttributes(final);

    const animate = rect.animate({ slience: true });
    animate.play(
      new GrowWidthIn(null, null, 1000, 'linear', {
        options: { overall: 0 },
        controlOptions: {}
      })
    );

    expect((rect as any).baseAttributes.x).toBe(40);
    expect((rect as any).baseAttributes.x1).toBe(260);
    expect((rect as any).baseAttributes.width).toBe(220);
    expect(rect.attribute.x).toBe(0);
    expect(rect.attribute.x1).toBe(0);
    expect(rect.attribute.width).toBe(0);
    expect(rect.getFinalAttribute().x).toBe(40);
    expect(rect.getFinalAttribute().x1).toBe(260);
    expect(rect.getFinalAttribute().width).toBe(220);

    animate.advance(1000);

    expect((rect as any).baseAttributes.x).toBe(40);
    expect((rect as any).baseAttributes.x1).toBe(260);
    expect((rect as any).baseAttributes.width).toBe(220);
    expect(rect.attribute.x).toBe(40);
    expect(rect.attribute.x1).toBe(260);
    expect(rect.attribute.width).toBe(220);
    expect(rect.getFinalAttribute().x).toBe(40);
    expect(rect.getFinalAttribute().x1).toBe(260);
    expect(rect.getFinalAttribute().width).toBe(220);
  });

  test('MotionPath keeps path frames transient and commits the endpoint by default', () => {
    const rect = createRect({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      visible: true
    });
    const path = {
      getLength: () => 100,
      getAttrAt: (distance: number) => ({ pos: { x: distance, y: 0 }, angle: 0 })
    };

    const animate = rect.animate({ slience: true });
    animate.play(
      new MotionPath(null, null, 100, 'linear', {
        path: path as any,
        distance: 0.5
      })
    );

    animate.advance(50);
    expect(rect.attribute.x).toBeCloseTo(25, 5);
    expect(rect.attribute.y).toBeCloseTo(0, 5);
    expect((rect as any).baseAttributes.x).toBe(0);
    expect((rect as any).baseAttributes.y).toBe(0);

    animate.advance(50);
    expect((rect as any).baseAttributes.x).toBeCloseTo(50, 5);
    expect((rect as any).baseAttributes.y).toBeCloseTo(0, 5);
    expect(rect.attribute.x).toBeCloseTo(50, 5);
    expect(rect.attribute.y).toBeCloseTo(0, 5);
  });

  test('MotionPath commitOnEnd=false restores the original static truth', () => {
    const rect = createRect({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      visible: true
    });
    const path = {
      getLength: () => 100,
      getAttrAt: (distance: number) => ({ pos: { x: distance, y: 0 }, angle: 0 })
    };

    const animate = rect.animate({ slience: true });
    animate.play(
      new MotionPath(null, null, 100, 'linear', {
        path: path as any,
        distance: 0.5,
        commitOnEnd: false
      })
    );

    animate.advance(50);
    expect(rect.attribute.x).toBeCloseTo(25, 5);
    expect((rect as any).baseAttributes.x).toBe(0);

    animate.advance(50);
    expect((rect as any).baseAttributes.x).toBe(0);
    expect((rect as any).baseAttributes.y).toBe(0);
    expect(rect.attribute.x).toBe(0);
    expect(rect.attribute.y).toBe(0);
  });

  test('MorphingPath saveOnEnd=false keeps morph frames transient and restores static truth', () => {
    const rect = createRect({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      opacity: 1,
      visible: true
    });

    const animate = rect.animate({ slience: true });
    animate.play(
      new MorphingPath(
        {
          morphingData: [
            {
              from: [0, 0, 0, 0, 10, 0, 10, 0],
              to: [0, 0, 0, 0, 20, 0, 20, 0],
              fromCp: [0, 0],
              toCp: [0, 0],
              rotation: 0
            }
          ],
          otherAttrs: [{ key: 'opacity', from: 1, to: 0.2 }]
        },
        100,
        'linear'
      )
    );

    animate.advance(50);
    expect(rect.attribute.opacity).toBeCloseTo(0.6, 5);
    expect((rect as any).baseAttributes.opacity).toBe(1);

    animate.advance(50);
    expect((rect as any).baseAttributes.opacity).toBe(1);
    expect(rect.attribute.opacity).toBe(1);
  });

  test('MorphingPath saveOnEnd=true commits the final morph attrs only at animation end', () => {
    const rect = createRect({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      opacity: 1,
      visible: true
    });

    const animate = rect.animate({ slience: true });
    animate.play(
      new MorphingPath(
        {
          morphingData: [
            {
              from: [0, 0, 0, 0, 10, 0, 10, 0],
              to: [0, 0, 0, 0, 20, 0, 20, 0],
              fromCp: [0, 0],
              toCp: [0, 0],
              rotation: 0
            }
          ],
          otherAttrs: [{ key: 'opacity', from: 1, to: 0.2 }],
          saveOnEnd: true
        },
        100,
        'linear'
      )
    );

    animate.advance(50);
    expect(rect.attribute.opacity).toBeCloseTo(0.6, 5);
    expect((rect as any).baseAttributes.opacity).toBe(1);

    animate.advance(50);
    expect((rect as any).baseAttributes.opacity).toBeCloseTo(0.2, 5);
    expect(rect.attribute.opacity).toBeCloseTo(0.2, 5);
  });

  test('IncreaseCount keeps number text frames transient and commits the final text at end', () => {
    const text = createText({ x: 0, y: 0, text: '0', fontSize: 12 });
    text.setFinalAttributes({ text: '100' });

    const animate = text.animate({ slience: true });
    animate.play(new IncreaseCount({ text: '0' }, { text: '100' }, 100, 'linear'));

    animate.advance(50);
    expect(text.attribute.text).toBe(50);
    expect((text as any).baseAttributes.text).toBe('0');
    expect(text.getFinalAttribute().text).toBe('100');

    animate.advance(50);
    expect((text as any).baseAttributes.text).toBe('100');
    expect(text.attribute.text).toBe('100');
    expect(text.getFinalAttribute().text).toBe('100');
  });

  test('InputText keeps typed frames transient and commits the complete text at end', () => {
    const text = createText({ x: 0, y: 0, text: '', fontSize: 12 });
    text.setFinalAttributes({ text: 'alpha' });

    const animate = text.animate({ slience: true });
    animate.play(new InputText({ text: '' }, { text: 'alpha' }, 100, 'linear'));

    animate.advance(50);
    expect(text.attribute.text).toBe('alp');
    expect((text as any).baseAttributes.text).toBe('');
    expect(text.getFinalAttribute().text).toBe('alpha');

    animate.advance(50);
    expect((text as any).baseAttributes.text).toBe('alpha');
    expect(text.attribute.text).toBe('alpha');
    expect(text.getFinalAttribute().text).toBe('alpha');
  });

  test('InputRichText keeps textConfig frames transient and commits the complete textConfig at end', () => {
    const fromTextConfig: any[] = [];
    const toTextConfig = [{ text: 'alpha', fontSize: 12, fill: 'black' }];
    const richText = createRichText({ x: 0, y: 0, textConfig: fromTextConfig });
    richText.setFinalAttributes({ textConfig: toTextConfig });

    const animate = richText.animate({ slience: true });
    animate.play(new InputRichText({ textConfig: fromTextConfig }, { textConfig: toTextConfig }, 100, 'linear'));

    animate.advance(50);
    expect(richText.attribute.textConfig).not.toEqual(toTextConfig);
    expect((richText as any).baseAttributes.textConfig).toEqual(fromTextConfig);
    expect(richText.getFinalAttribute().textConfig).toEqual(toTextConfig);

    animate.advance(50);
    expect((richText as any).baseAttributes.textConfig).toEqual(toTextConfig);
    expect(richText.attribute.textConfig).toEqual(toTextConfig);
    expect(richText.getFinalAttribute().textConfig).toEqual(toTextConfig);
  });

  test('text animation applied to a glyph subGraphic does not bypass the subGraphic static truth', () => {
    const glyph = createGlyph({});
    const subText = createText({ x: 0, y: 0, text: '', fontSize: 12 });
    glyph.setSubGraphic([subText]);
    subText.setFinalAttributes({ text: 'glyph' });

    const animate = subText.animate({ slience: true });
    animate.play(new InputText({ text: '' }, { text: 'glyph' }, 100, 'linear'));

    animate.advance(50);
    expect((glyph.getSubGraphic()[0] as any).attribute.text).toBe('gly');
    expect((subText as any).baseAttributes.text).toBe('');

    animate.advance(50);
    expect((subText as any).baseAttributes.text).toBe('glyph');
    expect((glyph.getSubGraphic()[0] as any).attribute.text).toBe('glyph');
    expect(subText.getFinalAttribute().text).toBe('glyph');
  });
});
